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
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;
    const todayYear = now.getFullYear();

    const todayOrders = rows.filter((row) => {
      const tanggalRaw = row[1]; // kolom B
      if (!tanggalRaw) return false;

      // contoh: "9/12/2025, 14.19.00"
      const datePart = tanggalRaw.split(",")[0]; // "9/12/2025"
      const [d, m, y] = datePart.split("/").map(Number);

      return d === todayDay && m === todayMonth && y === todayYear;
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
