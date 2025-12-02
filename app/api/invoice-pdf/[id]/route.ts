export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoiceId = id.trim();

    // Ambil data invoice dari API KOJE24
    const api = await fetch(`${req.nextUrl.origin}/api/invoice/${invoiceId}`, {
      cache: "no-store",
    });
    const json = await api.json();
    if (!json.success) throw new Error("Invoice tidak ditemukan");

    const data = json.data;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const line = (h = 18) => (y -= h);

    // Logo KOJE24
    try {
      const logoUrl = `${req.nextUrl.origin}/image/logo-koje24.png`;
      const imgBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      const logo = await pdfDoc.embedPng(imgBytes);
      page.drawImage(logo, { x: 50, y: 740, width: 120, height: 55 });
    } catch {}

    // Header kanan
    page.drawText("INVOICE", {
      x: 420,
      y: 780,
      size: 26,
      font: fontBold,
      color: rgb(0.07, 0.29, 0.31),
    });

    page.drawText(`#${data.invoiceId}`, {
      x: 420,
      y: 750,
      size: 16,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Tanggal: ${data.timestamp}`, {
      x: 420,
      y: 730,
      size: 11,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });

    // === Badge Status tanpa radius (fix build)
    const statusText = data.status.toUpperCase();
    const statusColor = (() => {
      const s = statusText.toLowerCase();
      if (s.includes("paid")) return rgb(0, 0.6, 0.2);
      if (s.includes("cod")) return rgb(0.0, 0.4, 0.8);
      if (s.includes("pending") || s.includes("belum"))
        return rgb(0.95, 0.7, 0.1);
      return rgb(0.55, 0.55, 0.55);
    })();

    const badgeX = 420;
    const badgeY = 700;
    const badgeW = 140;
    const badgeH = 22;

    page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeW,
      height: badgeH,
      color: statusColor,
      borderWidth: 0,
    });

    page.drawText(statusText, {
      x: badgeX + 12,
      y: badgeY + 6,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // === Pembeli
    y = 675;
    page.drawText("Pembeli:", {
      x: 50,
      y,
      size: 11,
      font: fontBold,
    });

    line();
    page.drawText(`${data.nama}`, { x: 50, y });
    line();
    page.drawText(`${data.alamat}`, { x: 50, y });
    line();
    page.drawText(`Telp: ${data.hp}`, { x: 50, y });

    // === Table Produk
    y -= 40;
    page.drawRectangle({
      x: 50,
      y: y - 25,
      width: 495,
      height: 25,
      color: rgb(0.96, 0.96, 0.96),
      borderWidth: 1,
      borderColor: rgb(0.85, 0.85, 0.85),
    });
    page.drawText("Deskripsi", { x: 60, y: y - 9, size: 11, font: fontBold });
    page.drawText("Qty", { x: 300, y: y - 9, size: 11, font: fontBold });
    page.drawText("Subtotal", { x: 440, y: y - 9, size: 11, font: fontBold });

    page.drawRectangle({
      x: 50,
      y: y - 55,
      width: 495,
      height: 30,
      borderWidth: 1,
      borderColor: rgb(0.9, 0.9, 0.9),
    });

    page.drawText(`${data.produkList}`, { x: 60, y: y - 39, size: 10 });
    page.drawText(`${data.qtyTotal}`, {
      x: 308,
      y: y - 39,
      size: 10,
    });
    page.drawText(
      `Rp ${data.subtotalCalc.toLocaleString("id-ID")}`,
      { x: 410, y: y - 39, size: 10 }
    );

    // === Total
    y -= 100;
    const totalRow = (label: string, val: number, bold = false) => {
      page.drawText(label, {
        x: 350,
        y,
        size: bold ? 12 : 11,
        font: bold ? fontBold : fontNormal,
      });
      page.drawText(`Rp ${val.toLocaleString("id-ID")}`, {
        x: 460,
        y,
        size: bold ? 12 : 11,
        font: bold ? fontBold : fontNormal,
      });
      y -= 18;
    };

    totalRow("Subtotal Produk:", data.subtotalCalc);
    totalRow("Ongkir:", data.effectiveOngkir);
    totalRow("TOTAL DIBAYARKAN:", data.effectiveGrandTotal, true); // HITAM BOLD SESUAI REQUEST

    // === QR CODE
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.invoiceUrl)}`;
const qrBytes = await fetch(qrUrl).then((res) => res.arrayBuffer());
const qrImg = await pdfDoc.embedPng(qrBytes);
    page.drawText("Scan untuk membuka invoice:", {
      x: 50,
      y: 160,
      size: 10,
      font: fontNormal,
    });
    page.drawImage(qrImg, { x: 50, y: 40, width: 110, height: 110 });

    // === Barcode
    try {
      const bcUrl = `https://barcodeapi.org/api/128/${data.invoiceId}`;
      const bcBytes = await fetch(bcUrl).then((r) => r.arrayBuffer());
      const bcImg = await pdfDoc.embedPng(bcBytes);
      page.drawImage(bcImg, { x: 360, y: 50, width: 175, height: 45 });
    } catch {}

    // === Footer
    page.drawText(
      "Terima kasih telah berbelanja di KOJE24 💛  Semoga sehat & berenergi setiap hari!",
      { x: 65, y: 20, size: 10, font: fontNormal, color: rgb(0.3, 0.3, 0.3) }
    );

    // === Watermark PAID
    if (statusText.includes("PAID")) {
      page.drawText("PAID", {
        x: 140,
        y: 380,
        size: 130,
        font: fontBold,
        color: rgb(0, 0.6, 0.2),
        opacity: 0.1,
        rotate: { type: "degrees", angle: -25 },
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoiceId}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
