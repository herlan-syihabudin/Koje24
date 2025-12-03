export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

function stripEmoji(text: string) {
  if (!text) return "";
  return text.replace(/[^\x00-\x7F]/g, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id.trim();

    const api = await fetch(`${req.nextUrl.origin}/api/invoice/${invoiceId}`, {
      cache: "no-store",
    });
    const json = await api.json();
    if (!json.success) throw new Error("Invoice tidak ditemukan");

    const data = json.data;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const line = (h = 18) => (y -= h);

    try {
      const logoUrl = `${req.nextUrl.origin}/image/logo-koje24.png`;
      const imgBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      const logo = await pdfDoc.embedPng(imgBytes);
      page.drawImage(logo, { x: 50, y: 740, width: 120, height: 55 });
    } catch {}

    page.drawText("INVOICE", {
      x: 420,
      y: 780,
      size: 26,
      font: fontBold,
      color: rgb(0.07, 0.29, 0.31),
    });

    page.drawText(`#${stripEmoji(data.invoiceId)}`, {
      x: 420,
      y: 750,
      size: 16,
      font: fontBold,
    });

    page.drawText(`Tanggal: ${stripEmoji(data.timestamp)}`, {
      x: 420,
      y: 730,
      size: 11,
      font: fontNormal,
    });

    const statusText = stripEmoji(data.status.toUpperCase());
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
    });

    page.drawText(statusText, {
      x: badgeX + 12,
      y: badgeY + 6,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    y = 675;
    page.drawText("Pembeli:", { x: 50, y, size: 11, font: fontBold });

    line();
    page.drawText(stripEmoji(data.nama), { x: 50, y });
    line();
    page.drawText(stripEmoji(data.alamat), { x: 50, y });
    line();
    page.drawText(stripEmoji(`Telp: ${data.hp}`), { x: 50, y });

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

    page.drawText(stripEmoji(data.produkList), { x: 60, y: y - 39, size: 10 });
    page.drawText(String(data.qtyTotal), { x: 308, y: y - 39, size: 10 });
    page.drawText(`Rp ${data.subtotalCalc.toLocaleString("id-ID")}`, {
      x: 410,
      y: y - 39,
      size: 10,
    });

    y -= 100;
    const totalRow = (label: string, val: number, bold = false) => {
      page.drawText(stripEmoji(label), {
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
    totalRow("TOTAL DIBAYARKAN:", data.effectiveGrandTotal, true);

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      data.invoiceUrl
    )}`;
    const qrBytes = await fetch(qrUrl).then((res) => res.arrayBuffer());
    const qrImg = await pdfDoc.embedPng(qrBytes);

    page.drawText("Scan untuk membuka invoice:", {
      x: 50,
      y: 160,
      size: 10,
      font: fontNormal,
    });
    page.drawImage(qrImg, { x: 50, y: 40, width: 110, height: 110 });

    try {
      const bcUrl = `https://barcodeapi.org/api/128/${invoiceId}`;
      const bcBytes = await fetch(bcUrl).then((r) => r.arrayBuffer());
      const bcImg = await pdfDoc.embedPng(bcBytes);
      page.drawImage(bcImg, { x: 360, y: 50, width: 175, height: 45 });
    } catch {}

    page.drawText(
      stripEmoji(
        "Terima kasih telah berbelanja di KOJE24 💛  Semoga sehat & berenergi setiap hari!"
      ),
      {
        x: 65,
        y: 20,
        size: 10,
        font: fontNormal,
        color: rgb(0.3, 0.3, 0.3),
      }
    );

    if (statusText.includes("PAID")) {
      page.drawText("PAID", {
        x: 140,
        y: 380,
        size: 130,
        font: fontBold,
        color: rgb(0, 0.6, 0.2),
        opacity: 0.1,
        rotate: degrees(-25),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Response(Buffer.from(pdfBytes), {
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
