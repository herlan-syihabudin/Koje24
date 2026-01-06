import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice, status } = body;

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

    // Cari baris berdasarkan invoice
    const rowIndex = rows.findIndex(
      (row) => String(row[0]).trim() === String(invoice).trim()
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    // Karena range mulai dari A2, maka:
    const sheetRowNumber = rowIndex + 2; // real row di Google Sheet

    // Update kolom Status (M)
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
      message: "Status berhasil diperbarui",
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
