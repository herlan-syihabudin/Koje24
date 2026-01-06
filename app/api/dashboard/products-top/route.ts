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
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];
    const now = new Date();

    const productMap: Record<
      string,
      { qty: number; revenue: number }
    > = {};

    rows.forEach((row) => {
      const tanggal = row[1]; // B
      const produkRaw = row[5]; // F
      const qty = Number(row[6] || 0); // G
      const totalBayar = Number(row[9] || 0); // J
      const status = row[12]; // M

      if (!tanggal || !produkRaw) return;
      if (status !== "PAID") return;

      const dt = parseTanggal(tanggal);
      if (!dt) return;

      // filter bulan ini
      if (
        dt.getMonth() !== now.getMonth() ||
        dt.getFullYear() !== now.getFullYear()
      )
        return;

      // contoh produk: "Golden Detox (1x)"
      const productName = produkRaw.replace(/\(.*?\)/g, "").trim();

      if (!productMap[productName]) {
        productMap[productName] = { qty: 0, revenue: 0 };
      }

      productMap[productName].qty += qty;
      productMap[productName].revenue += totalBayar;
    });

    const result = Object.entries(productMap)
      .map(([produk, data]) => ({
        produk,
        totalQty: data.qty,
        totalRevenue: data.revenue,
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
