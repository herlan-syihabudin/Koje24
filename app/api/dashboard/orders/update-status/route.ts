import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const { rowIndex, status } = await req.json();

    if (!rowIndex || !status) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${rowIndex}`, // 🔥 KOLOM STATUS
      valueInputOption: "RAW",
      requestBody: {
        values: [[status.toUpperCase()]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
