import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const datePart = String(tanggalRaw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

type ProductAgg = { qty: number; revenue: number };

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];
    const now = new Date();

    const productMap: Record<string, ProductAgg> = {};

    rows.forEach((row) => {
      const tanggal = row[1]; // B
      const produkRaw = row[5]; // F
      const qty = Number(row[6] || 1); // G
      const totalBayar = Number(row[9] || 0); // J
      const status = String(row[12] || "").toUpperCase(); // M

      if (!tanggal || !produkRaw) return;
      if (status !== "PAID") return;

      const dt = parseTanggal(String(tanggal));
      if (!dt) return;

      // filter bulan ini
      if (
        dt.getMonth() !== now.getMonth() ||
        dt.getFullYear() !== now.getFullYear()
      )
        return;

      // 🔥 split produk (kalau 1 order berisi beberapa produk)
      const products: string[] = String(produkRaw)
        .split(",")
        .map((p: string) => p.replace(/\(.*?\)/g, "").trim())
        .filter((p: string) => p.length > 0);

      if (products.length === 0) return;

      // bagi rata qty & revenue ke tiap item dalam paket
      const qtyPerProduct = qty / products.length;
      const revenuePerProduct = totalBayar / products.length;

      products.forEach((productName: string) => {
        if (!productMap[productName]) {
          productMap[productName] = { qty: 0, revenue: 0 };
        }
        productMap[productName].qty += qtyPerProduct;
        productMap[productName].revenue += revenuePerProduct;
      });
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
