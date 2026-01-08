import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

const ALLOWED_STATUS = ["PENDING", "PAID", "DIPROSES", "DIKIRIM", "SELESAI"] as const;

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export async function POST(req: NextRequest) {
  // 🔐 GUARD ADMIN
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  const adminEmail = guard.admin.email;

  try {
    const { invoice, status } = await req.json();

    if (!invoice || !status) {
      return NextResponse.json(
        { success: false, message: "invoice & status wajib diisi" },
        { status: 400 }
      );
    }

    const cleanInvoice = String(invoice).trim();
    const cleanStatus = String(status).trim().toUpperCase();

    if (!ALLOWED_STATUS.includes(cleanStatus as any)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // 1️⃣ ambil data transaksi
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => String(row[0] || "").trim() === cleanInvoice
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = rowIndex + 2;

    const oldStatus = String(rows[rowIndex][12] || "")
      .toUpperCase()
      .trim(); // kolom M
    const closedFlag = String(rows[rowIndex][15] || "")
      .toUpperCase()
      .trim(); // kolom P

    // 🔒 jika sudah CLOSED
    if (closedFlag === "YES") {
      return NextResponse.json(
        { success: false, message: "Order sudah CLOSED, status tidak bisa diubah." },
        { status: 403 }
      );
    }

    // 🔒 jika sudah SELESAI
    if (oldStatus === "SELESAI") {
      return NextResponse.json(
        { success: false, message: "Order SELESAI bersifat final." },
        { status: 403 }
      );
    }

    // 2️⃣ update status
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[cleanStatus]] },
    });

    // 3️⃣ audit log (DITAMBAH ADMIN EMAIL)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Audit_Log!A:G",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          now(),
          cleanInvoice,
          "UPDATE_STATUS",
          oldStatus,
          cleanStatus,
          "dashboard",
          adminEmail,
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
