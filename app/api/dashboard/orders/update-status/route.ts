import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const { invoice, status } = await req.json();

    if (!invoice || !status) {
      return NextResponse.json(
        { success: false, message: "Invoice & status wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil semua data transaksi
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    // 🔥 Cari baris berdasarkan INVOICE (AMAN)
    const rowIndex = rows.findIndex(
      (row) => String(row[0]).trim() === String(invoice).trim()
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRowNumber = rowIndex + 2;

    // Update kolom STATUS (M)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${sheetRowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    return NextResponse.json({
      success: true,
      invoice,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
