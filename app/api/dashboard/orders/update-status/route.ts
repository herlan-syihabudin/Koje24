import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

const ALLOWED_STATUS = [
  "PENDING",
  "PAID",
  "DIPROSES",
  "DIKIRIM",
  "SELESAI",
];

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

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

    // 1️⃣ Ambil data transaksi
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
    const oldStatus = String(rows[rowIndex][12] || "").toUpperCase(); // kolom M

    // 2️⃣ Update STATUS (kolom M)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[cleanStatus]],
      },
    });

    // 3️⃣ TULIS AUDIT LOG 🔥
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Audit_Log!A:F",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          now(),
          invoice,
          "UPDATE_STATUS",
          oldStatus,
          cleanStatus,
          "dashboard"
        ]],
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
