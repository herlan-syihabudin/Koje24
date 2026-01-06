import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const datePart = String(tanggalRaw).split(",")[0]?.trim(); // 6/1/2026
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

    const orders = rows
      .map((row) => ({
        invoice: row[0],
        tanggalRaw: row[1],
        nama: row[2],
        produk: row[5],
        qty: Number(row[6] || 0),
        totalBayar: Number(row[9] || 0),
        metodeBayar: row[11],
        status: row[12],
        tanggal: parseTanggal(row[1]),
      }))
      .filter((o) => o.tanggal && o.status === "PAID")
      .sort((a, b) => b.tanggal!.getTime() - a.tanggal!.getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
