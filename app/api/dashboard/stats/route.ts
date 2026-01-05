import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Orders!A2:A",
    });

    const rows = res.data.values || [];
    const totalOrders = rows.filter(row => row[0]).length;

    return NextResponse.json({
      success: true,
      totalOrders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data order",
      },
      { status: 500 }
    );
  }
}
