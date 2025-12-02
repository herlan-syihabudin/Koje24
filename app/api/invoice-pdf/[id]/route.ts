export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

interface InvoiceData {
  invoiceId: string;
  timestamp: string;
  nama: string;
  hp: string;
  alamat: string;
  produkList: string;
  qtyTotal: number;
  subtotalCalc: number;
  status: string;
  paymentLabel: string;
  effectiveOngkir: number;
  effectiveGrandTotal: number;
  invoiceUrl: string;
}

// Format Rupiah
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Parse timestamp "30/11/2025, 14.00.54" → Date
function parseTimestamp(ts: string) {
  if (!ts) return null;
  const [tanggal, waktu] = ts.split(", ");
  const [dd, mm, yyyy] = tanggal.split("/");
  const waktuFix = waktu.replace(/\./g, ":");
  const iso = `${yyyy}-${mm}-${dd}T${waktuFix}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoiceId = id?.trim();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "Invoice ID kosong" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ambil origin (base URL) dari request
    const { origin } = new URL(req.url);

    // Fetch data invoice dari API internal (Google Sheet)
    const invRes = await fetch(`${origin}/api/invoice/${invoiceId}`, {
      cache: "no-store",
    });

    if (!invRes.ok) {
      const text = await invRes.text();
      return new Response(
        JSON.stringify({
          error: "Gagal mengambil data invoice",
          detail: text,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const json = await invRes.json();
    if (!json.success) {
      return new Response(
        JSON.stringify({
          error: "Invoice tidak ditemukan",
          detail: json.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const invoice = json.data as InvoiceData;

    // ===== Mulai bangun PDF A4 =====
    const pdfDoc = await PDFDocument.create();

    // A4 portrait (point)
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 40;

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Background watermark PAID
    const statusLower = invoice.status.toLowerCase();
    if (statusLower.includes("paid") || statusLower.includes("lunas")) {
      const watermarkText = "PAID";
      const wmSize = 90;
      const textWidth = fontBold.widthOfTextAtSize(watermarkText, wmSize);

      page.drawText(watermarkText, {
        x: (width - textWidth) / 2,
        y: height / 2 - wmSize / 2,
        size: wmSize,
        font: fontBold,
        color: rgb(0.8, 0.9, 0.8),
        rotate: degrees(-25),
        opacity: 0.18,
      });
    }

    // ===== Header: Logo & Info Toko =====
    let y = height - margin;

    // Logo KOJE24 (optional, kalau gagal fetch, di-skip aja)
    try {
      const logoUrl = `${origin}/image/logo-koje24.png`;
      const logoRes = await fetch(logoUrl);
      if (logoRes.ok) {
        const logoBytes = await logoRes.arrayBuffer();
        const logoImg = await pdfDoc.embedPng(logoBytes);
        const logoDims = logoImg.scale(0.2); // kecilin dikit

        page.drawImage(logoImg, {
          x: margin,
          y: y - logoDims.height + 10,
          width: logoDims.width,
          height: logoDims.height,
        });
      }
    } catch {
      // kalau gagal logo, abaikan saja
    }

    // Info toko
    const tokoX = margin;
    const tokoY = y - 60;

    page.drawText("KOJE24 Official", {
      x: tokoX,
      y: tokoY,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText("Jl. Kopi Kenangan No. 24, Jakarta Selatan", {
      x: tokoX,
      y: tokoY - 16,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText("Telp: 0811-2233-4455", {
      x: tokoX,
      y: tokoY - 30,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Header kanan: INVOICE + id + tanggal + badge status
    const headerRightX = width - margin - 220;

    page.drawText("INVOICE", {
      x: headerRightX,
      y,
      size: 24,
      font: fontBold,
      color: rgb(0.043, 0.294, 0.313), // #0B4B50
    });

    page.drawText(`#${invoice.invoiceId}`, {
      x: headerRightX,
      y: y - 24,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    const parsedDate = parseTimestamp(invoice.timestamp);
    const tanggalStr = parsedDate
      ? parsedDate.toLocaleString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : invoice.timestamp;

    page.drawText(`Tanggal: ${tanggalStr}`, {
      x: headerRightX,
      y: y - 42,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Badge status (rounded pill)
    const statusText = invoice.status.toUpperCase();
    const statusWidth = fontBold.widthOfTextAtSize(statusText, 9) + 24;
    const statusHeight = 18;
    const badgeX = headerRightX;
    const badgeY = y - 70;

    let badgeColor = rgb(0.75, 0.75, 0.75);
    if (statusLower.includes("paid") || statusLower.includes("lunas")) {
      badgeColor = rgb(0.75 * 0.2 + 0.25, 0.9, 0.75); // hijau lembut
    } else if (statusLower.includes("cod")) {
      badgeColor = rgb(0.7, 0.8, 1); // biru lembut
    } else if (statusLower.includes("pending") || statusLower.includes("belum")) {
      badgeColor = rgb(1, 0.97, 0.75); // kuning lembut
    }

    // pill background
    page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: statusWidth,
      height: statusHeight,
      color: badgeColor,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.6,
      borderOpacity: 1,
      opacity: 1,
      radius: 9,
    });

    // text status
    page.drawText(statusText, {
      x: badgeX + 12,
      y: badgeY + 5,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    // ===== Pembeli (Bill To) =====
    let sectionY = badgeY - 30;

    page.drawText("Pembeli", {
      x: margin,
      y: sectionY,
      size: 11,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    sectionY -= 16;
    page.drawText(invoice.nama || "-", {
      x: margin,
      y: sectionY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    sectionY -= 14;
    page.drawText(invoice.alamat || "-", {
      x: margin,
      y: sectionY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
      maxWidth: width - margin * 2,
      lineHeight: 11,
    });

    sectionY -= 18;
    page.drawText(`Telp: ${invoice.hp || "-"}`, {
      x: margin,
      y: sectionY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // ===== Tabel Produk =====
    sectionY -= 30;

    const tableX = margin;
    const tableWidth = width - margin * 2;
    const colDescWidth = tableWidth * 0.6;
    const colQtyWidth = tableWidth * 0.15;
    const colSubtotalWidth = tableWidth * 0.25;
    const rowHeight = 22;

    // Header background
    page.drawRectangle({
      x: tableX,
      y: sectionY - rowHeight + 4,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.6,
    });

    // Header text
    page.drawText("Deskripsi", {
      x: tableX + 8,
      y: sectionY - 10,
      size: 10,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    page.drawText("Qty", {
      x: tableX + colDescWidth + 10,
      y: sectionY - 10,
      size: 10,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    page.drawText("Subtotal", {
      x: tableX + colDescWidth + colQtyWidth + 10,
      y: sectionY - 10,
      size: 10,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    // Row isi
    const rowY = sectionY - rowHeight - 6;
    page.drawRectangle({
      x: tableX,
      y: rowY,
      width: tableWidth,
      height: rowHeight,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 0.6,
      color: rgb(1, 1, 1),
    });

    // Deskripsi produk (string gabungan)
    page.drawText(invoice.produkList || "-", {
      x: tableX + 8,
      y: rowY + 6,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: colDescWidth - 12,
    });

    // Qty
    const qtyStr = String(invoice.qtyTotal ?? 0);
    const qtyTextWidth = fontRegular.widthOfTextAtSize(qtyStr, 9);
    page.drawText(qtyStr, {
      x: tableX + colDescWidth + (colQtyWidth - qtyTextWidth) / 2,
      y: rowY + 6,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Subtotal
    const subtotalStr = formatCurrency(invoice.subtotalCalc || 0);
    const subtotalTextWidth = fontRegular.widthOfTextAtSize(subtotalStr, 9);
    page.drawText(subtotalStr, {
      x: tableX + colDescWidth + colQtyWidth + colSubtotalWidth - subtotalTextWidth - 8,
      y: rowY + 6,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // ===== TOTAL SECTION (kanan bawah tabel) =====
    let totalY = rowY - 30;

    const labelX = tableX + tableWidth - 180;
    const valueX = tableX + tableWidth - 20;

    // Subtotal
    const subLabel = "Subtotal Produk:";
    const subVal = formatCurrency(invoice.subtotalCalc || 0);
    const subValWidth = fontRegular.widthOfTextAtSize(subVal, 10);

    page.drawText(subLabel, {
      x: labelX,
      y: totalY,
      size: 10,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });
    page.drawText(subVal, {
      x: valueX - subValWidth,
      y: totalY,
      size: 10,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });

    // Ongkir
    totalY -= 16;
    const ongkirLabel = "Ongkir:";
    const ongkirVal = formatCurrency(invoice.effectiveOngkir || 0);
    const ongkirWidth = fontRegular.widthOfTextAtSize(ongkirVal, 10);

    page.drawText(ongkirLabel, {
      x: labelX,
      y: totalY,
      size: 10,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });
    page.drawText(ongkirVal, {
      x: valueX - ongkirWidth,
      y: totalY,
      size: 10,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });

    // TOTAL DIBAYARKAN (hitam tebal)
    totalY -= 22;
    const totalLabel = "TOTAL DIBAYARKAN:";
    const totalVal = formatCurrency(invoice.effectiveGrandTotal || 0);
    const totalValWidth = fontBold.widthOfTextAtSize(totalVal, 12);

    page.drawRectangle({
      x: labelX - 8,
      y: totalY - 6,
      width: (valueX - (labelX - 8)),
      height: 26,
      color: rgb(0.97, 0.97, 0.97),
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 0.6,
    });

    page.drawText(totalLabel, {
      x: labelX,
      y: totalY,
      size: 11,
      font: fontBold,
      color: rgb(0.05, 0.05, 0.05),
    });

    page.drawText(totalVal, {
      x: valueX - totalValWidth,
      y: totalY,
      size: 12,
      font: fontBold,
      color: rgb(0.05, 0.05, 0.05), // hitam tebal
    });

    // ===== QR & Barcode =====
    let bottomSectionY = totalY - 70;

    // QR Code (ambil dari external API, atau fallback ke invoiceUrl text)
    try {
      const qrData = invoice.invoiceUrl || `${origin}/invoice/${invoice.invoiceId}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
        qrData
      )}`;
      const qrRes = await fetch(qrUrl);
      if (qrRes.ok) {
        const qrBytes = await qrRes.arrayBuffer();
        const qrImg = await pdfDoc.embedPng(qrBytes);
        const qrDims = qrImg.scale(1);

        page.drawText("Scan untuk membuka invoice online:", {
          x: margin,
          y: bottomSectionY + 110,
          size: 9,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawImage(qrImg, {
          x: margin,
          y: bottomSectionY,
          width: qrDims.width,
          height: qrDims.height,
        });
      }
    } catch {
      // kalau QR gagal, diabaikan
    }

    // Barcode
    try {
      const barcodeUrl = `https://barcodeapi.org/api/128/${encodeURIComponent(
        invoice.invoiceId
      )}`;
      const bcRes = await fetch(barcodeUrl);
      if (bcRes.ok) {
        const bcBytes = await bcRes.arrayBuffer();
        const bcImg = await pdfDoc.embedPng(bcBytes);
        const bcDims = bcImg.scale(0.6);

        page.drawImage(bcImg, {
          x: width - margin - bcDims.width,
          y: bottomSectionY + 10,
          width: bcDims.width,
          height: bcDims.height,
        });
      }
    } catch {
      // abaikan kalau gagal
    }

    // ===== FOOTER =====
    page.drawLine({
      start: { x: margin, y: margin + 40 },
      end: { x: width - margin, y: margin + 40 },
      thickness: 0.6,
      color: rgb(0.85, 0.85, 0.85),
    });

    page.drawText(
      "Terima kasih telah berbelanja di KOJE24. Semoga sehat & berenergi setiap hari!",
      {
        x: margin,
        y: margin + 22,
        size: 9,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
        maxWidth: width - margin * 2,
      }
    );

    page.drawText("Generated by KOJE24 • Natural Cold-Pressed Juice", {
      x: margin,
      y: margin + 8,
      size: 8,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6),
    });

    // ===== Return PDF =====
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to generate PDF",
        detail: err?.message ?? err,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
