import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const dynamic = "force-dynamic";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id?.trim();
    if (!invoiceId) return new NextResponse("Invoice ID kosong", { status: 400 });

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:M",
    });

    const rows = res.data.values?.slice(1) || [];
    const row = rows.find((r) => (r[1] || "").trim() === invoiceId);
    if (!row) return new NextResponse("Invoice tidak ditemukan", { status: 404 });

    const data = {
      invoiceId,
      timestamp: row[0] ?? "",
      nama: row[2] ?? "",
      hp: row[3] ?? "",
      alamat: row[4] ?? "",
      produkList: row[5] ?? "",
      qtyTotal: Number(row[6] ?? 0),
      subtotalCalc: Number(row[7] ?? 0),
      ongkir: Number(row[10] ?? 0),
      grandTotal: Number(row[11] ?? 0),
    };

    // === PDF Generation ===
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([600, 750]);

    const draw = (text: string, y: number, size = 12) =>
      page.drawText(text, { x: 40, y, size, font });

    let y = 700;
    draw("📄 INVOICE KOJE24", y, 22);
    y -= 50;
    draw(`Tanggal     : ${data.timestamp}`, y); y -= 20;
    draw(`Invoice ID  : ${data.invoiceId}`, y); y -= 20;
    draw(`Nama        : ${data.nama}`, y); y -= 20;
    draw(`No HP       : ${data.hp}`, y); y -= 20;
    draw(`Alamat      : ${data.alamat}`, y); y -= 40;
    draw(`Produk      : ${data.produkList}`, y); y -= 20;
    draw(`Qty Total   : ${data.qtyTotal}`, y); y -= 20;
    draw(`Subtotal    : Rp ${data.subtotalCalc.toLocaleString("id-ID")}`, y); y -= 20;
    draw(`Ongkir      : Rp ${data.ongkir.toLocaleString("id-ID")}`, y); y -= 30;
    draw(
      `Grand Total : Rp ${data.grandTotal.toLocaleString("id-ID")}`,
      y,
      15
    );

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoiceId}.pdf"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || "Server error", { status: 500 });
  }
}
