import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoiceId = params.id;

  // 🔥 Ambil data invoice dari API internal
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/${invoiceId}`, {
    cache: "no-store",
  });
  const result = await res.json();
  if (!result.success) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  const invoice = result.data;

  // 🧾 Buat PDF
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: any[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {});

  doc.fontSize(20).text("INVOICE KOJE24", { align: "center" }).moveDown(1);
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceId}`);
  doc.text(`Tanggal: ${invoice.timestamp}`).moveDown(1);

  doc.text(`Pembeli:`);
  doc.text(`${invoice.nama}`);
  doc.text(`${invoice.alamat}`);
  doc.text(`Telp: ${invoice.hp}`).moveDown(1);

  doc.moveDown(1);
  doc.text("Rincian:", { underline: true }).moveDown(0.5);
  doc.text(`Produk      : ${invoice.produkList}`);
  doc.text(`Qty         : ${invoice.qtyTotal}`);
  doc.text(`Subtotal    : Rp ${invoice.subtotalCalc.toLocaleString("id-ID")}`);
  doc.text(`Ongkir      : Rp ${invoice.effectiveOngkir.toLocaleString("id-ID")}`);
  doc.text("--------------------------------------------");
  doc.fontSize(14).text(`TOTAL       : Rp ${invoice.effectiveGrandTotal.toLocaleString("id-ID")}`, { bold: true });

  doc.moveDown(2);
  doc.fontSize(12).text("Terima kasih telah berbelanja di KOJE24 💛", { align: "center" });

  doc.end();

  return new NextResponse(Buffer.concat(chunks), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceId}.pdf`,
    },
  });
}
