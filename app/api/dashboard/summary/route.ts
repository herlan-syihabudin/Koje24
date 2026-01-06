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
    const today =
      String(now.getDate()).padStart(2, "0") +
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      now.getFullYear();

    const month =
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      now.getFullYear();

    let todayOrders = 0;
    let monthOrders = 0;
    let totalRevenue = 0;

    rows.forEach((row) => {
      const tanggal = row[1]; // B
      const totalBayar = Number(row[9] || 0); // J
      const metode = row[11]; // L

      if (!tanggal) return;

      // ORDER HARI INI
      if (tanggal.startsWith(today)) {
        todayOrders++;
      }

      // ORDER BULAN INI
      if (tanggal.includes(month)) {
        monthOrders++;
        totalRevenue += totalBayar;
      }
    });

    return NextResponse.json({
      success: true,
      todayOrders,
      monthOrders,
      totalRevenue,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
