import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    const now = new Date();

    const todayOrders = rows.filter((row) => {
      const tanggalRaw = row[1]; // kolom B (Tanggal)
      if (!tanggalRaw) return false;

      // contoh: "5/1/2026, 12.24.38"
      const [datePart] = tanggalRaw.split(",");
      const [d, m, y] = datePart.split("/").map(Number);

      if (!d || !m || !y) return false;

      const orderDate = new Date(y, m - 1, d);

      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return NextResponse.json({
      success: true,
      todayOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
