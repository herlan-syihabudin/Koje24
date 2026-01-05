import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    // format hari ini -> DD/MM/YYYY
    const now = new Date();
    const today =
      String(now.getDate()).padStart(2, "0") +
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      now.getFullYear();

    const todayOrders = rows.filter((row) => {
      const tanggal = row[1]; // kolom B
      const status = row[12]; // kolom M

      if (!tanggal || !status) return false;

      return tanggal.startsWith(today) && status === "PAID";
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
