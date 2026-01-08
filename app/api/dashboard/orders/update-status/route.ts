import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

const ALLOWED_STATUS = ["PENDING", "PAID", "DIPROSES", "DIKIRIM", "SELESAI"] as const;

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export async function POST(req: Request) {
  try {
    const { invoice, status } = await req.json();

    if (!invoice || !status) {
      return NextResponse.json({ success: false, message: "invoice & status wajib diisi" }, { status: 400 });
    }

    const cleanInvoice = String(invoice).trim();
    const cleanStatus = String(status).trim().toUpperCase();

    if (!ALLOWED_STATUS.includes(cleanStatus as any)) {
      return NextResponse.json({ success: false, message: "Status tidak valid" }, { status: 400 });
    }

    // 1) ambil data transaksi sampai kolom P (closed)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row) => String(row[0] || "").trim() === cleanInvoice);

    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: "Invoice tidak ditemukan" }, { status: 404 });
    }

    const sheetRow = rowIndex + 2;

    const oldStatus = String(rows[rowIndex][12] || "").toUpperCase().trim(); // M
    const closedFlag = String(rows[rowIndex][15] || "").toUpperCase().trim(); // P

    // ✅ KUNCI: kalau sudah closed, STOP
    if (closedFlag === "YES") {
      return NextResponse.json(
        { success: false, message: "Order sudah CLOSED, status tidak bisa diubah." },
        { status: 403 }
      );
    }

    // (opsional tapi bagus) kalau sudah selesai, kunci juga
    if (oldStatus === "SELESAI") {
      return NextResponse.json(
        { success: false, message: "Order SELESAI bersifat final." },
        { status: 403 }
      );
    }

    // 2) update status
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[cleanStatus]] },
    });

    // 3) audit log
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Audit_Log!A:F",
      valueInputOption: "RAW",
      requestBody: {
        values: [[now(), cleanInvoice, "UPDATE_STATUS", oldStatus, cleanStatus, "dashboard"]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
