import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

/* =====================
   UTIL TANGGAL
===================== */
function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;

  const datePart = String(tanggalRaw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;

  return new Date(y, m - 1, d);
}

/* =====================
   NORMALISASI PRODUK
===================== */
const PRODUCT_ALIASES: Record<string, string> = {
  "golden detox": "Golden Detox",
  "green revive": "Green Revive",
  "red vitality": "Red Vitality",
  "lemongrass fresh": "Lemongrass Fresh",
};

function normalizeProducts(raw: string): string[] {
  if (!raw) return [];

  const cleaned = raw
    .replace(/â€”|—/g, "-")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();

  const parts = cleaned
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const results: string[] = [];

  parts.forEach((p) => {
    const key = p.toLowerCase();
    for (const alias in PRODUCT_ALIASES) {
      if (key.includes(alias)) {
        results.push(PRODUCT_ALIASES[alias]);
        return;
      }
    }
  });

  return results;
}

/* =====================
   TYPE
===================== */
type ProductAgg = {
  qty: number;
  revenue: number;
};

/* =====================
   GET TOP PRODUCTS (BULAN INI)
===================== */
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
      const tanggal = row[1];               // B
      const produkRaw = row[5];             // F
      const qty = Number(row[6] || 1);      // G
      const totalBayar = Number(row[9] || 0); // J
      const status = String(row[12] || "").toUpperCase(); // M

      if (!tanggal || !produkRaw) return;
      if (status !== "PAID") return;

      const dt = parseTanggal(String(tanggal));
      if (!dt) return;

      // filter bulan & tahun sekarang
      if (
        dt.getMonth() !== now.getMonth() ||
        dt.getFullYear() !== now.getFullYear()
      ) return;

      const products = normalizeProducts(String(produkRaw));
      if (products.length === 0) return;

      const qtyPerProduct = qty / products.length;
      const revenuePerProduct = totalBayar / products.length;

      products.forEach((name) => {
        if (!productMap[name]) {
          productMap[name] = { qty: 0, revenue: 0 };
        }
        productMap[name].qty += qtyPerProduct;
        productMap[name].revenue += revenuePerProduct;
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
