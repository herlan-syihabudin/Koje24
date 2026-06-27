import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const datePart = String(tanggalRaw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export async function GET() {
  try {
    // 🔥 FIX: Range sampai kolom P
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P", // ← UBAH DARI A2:O JADI A2:P
    });

    const rows = res.data.values || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const productMap: Record<string, { qty: number; revenue: number }> = {};

    rows.forEach((row) => {
      const tanggal = row[1];
      const produkRaw = row[5];
      const qty = Number(row[6] || 1);
      const totalBayar = Number(row[9] || 0);
      const status = String(row[12] || "").trim().toUpperCase();

      // Validasi dasar
      if (!tanggal || !produkRaw) return;
      if (status !== "PAID") return;

      const dt = parseTanggal(String(tanggal));
      if (!dt) return;

      // Filter bulan dan tahun sekarang
      if (dt.getMonth() !== currentMonth || dt.getFullYear() !== currentYear) return;

      // 🔥 SEDERHANAKAN PARSING PRODUK
      let productName = String(produkRaw).trim();
      // Hapus teks dalam kurung dan tanda kurung siku
      productName = productName.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim();
      // Ambil hanya bagian sebelum koma pertama (produk utama)
      if (productName.includes(",")) {
        productName = productName.split(",")[0].trim();
      }

      if (!productName) return;

      if (!productMap[productName]) {
        productMap[productName] = { qty: 0, revenue: 0 };
      }
      productMap[productName].qty += qty;
      productMap[productName].revenue += totalBayar;
    });

    const result = Object.entries(productMap)
      .map(([produk, data]) => ({
        produk,
        totalQty: Math.round(data.qty),
        totalRevenue: Math.round(data.revenue),
      }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      products: result,
    });
  } catch (error: any) {
    console.error("Products-top API error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
