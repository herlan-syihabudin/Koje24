import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

const ALLOWED_STATUS = [
  "PENDING",
  "PAID",
  "DIPROSES",
  "DIKIRIM",
  "SELESAI",
];

export async function POST(req: Request) {
  try {
    const { invoice, status } = await req.json();

    if (!invoice || !status) {
      return NextResponse.json(
        { success: false, message: "invoice & status wajib diisi" },
        { status: 400 }
      );
    }

    const cleanStatus = String(status).trim().toUpperCase();

    if (!ALLOWED_STATUS.includes(cleanStatus)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 }
      );
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    const rowIndex = rows.findIndex(
      (row) => String(row[0]).trim() === String(invoice).trim()
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = rowIndex + 2;

    // Kolom M = STATUS ORDER
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[cleanStatus]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
