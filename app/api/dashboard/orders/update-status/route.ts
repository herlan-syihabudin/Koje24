import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const { rowIndex, status } = await req.json();

    if (!rowIndex || !status) {
      return NextResponse.json(
        { success: false, message: "rowIndex & status wajib diisi" },
        { status: 400 }
      );
    }

    // 🔥 UPDATE LANGSUNG KE BARIS YANG TEPAT
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${rowIndex}`, // kolom STATUS
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    return NextResponse.json({
      success: true,
      rowIndex,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal update status",
      },
      { status: 500 }
    );
  }
}
