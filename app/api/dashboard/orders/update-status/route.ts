// app/api/dashboard/orders/update-status/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

// 🔥 STATUS YANG DIIZINKAN
const ALLOWED_STATUS = [
  "PENDING",
  "PAID",
  "COD",
  "DIPROSES",
  "DIKIRIM",
  "SELESAI",
  "CANCELLED"
] as const;

// 🔥 FLOW STATUS (CEGAH DOWNGRADE)
const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["PAID", "COD", "CANCELLED"],
  COD: ["DIPROSES"],
  PAID: ["DIPROSES"],
  DIPROSES: ["DIKIRIM"],
  DIKIRIM: ["SELESAI"],
  SELESAI: [],
  CANCELLED: [],
};

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 GUARD ADMIN
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const { admin } = guard;
    const adminEmail = admin.email;

    const { invoice, status } = await req.json();

    // 🔥 VALIDASI INPUT
    if (!invoice || !status) {
      return NextResponse.json(
        { success: false, message: "invoice & status wajib diisi" },
        { status: 400 }
      );
    }

    const cleanInvoice = String(invoice).trim();
    const cleanStatus = String(status).trim().toUpperCase();

    // 🔥 VALIDASI STATUS
    if (!ALLOWED_STATUS.includes(cleanStatus as any)) {
      return NextResponse.json(
        { success: false, message: `Status tidak valid. Gunakan: ${ALLOWED_STATUS.join(", ")}` },
        { status: 400 }
      );
    }

    // 1️⃣ AMBIL DATA TRANSAKSI
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
    const oldStatus = String(rows[rowIndex][12] || "").toUpperCase().trim();
    const closedFlag = String(rows[rowIndex][15] || "").toUpperCase().trim();

    // 🔒 CEK CLOSED
    if (closedFlag === "YES") {
      return NextResponse.json(
        { success: false, message: "Order sudah CLOSED, status tidak bisa diubah." },
        { status: 403 }
      );
    }

    // 🔒 CEK SELESAI (FINAL)
    if (oldStatus === "SELESAI") {
      return NextResponse.json(
        { success: false, message: "Order SELESAI bersifat final." },
        { status: 403 }
      );
    }

    // 🔥 CEK STATUS FLOW (CEGAH DOWNGRADE)
    const allowedNext = STATUS_FLOW[oldStatus] || [];
    if (!allowedNext.includes(cleanStatus) && oldStatus !== cleanStatus) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Status tidak bisa berubah dari ${oldStatus} ke ${cleanStatus}. Status yang diizinkan: ${allowedNext.join(", ") || "tidak ada"}` 
        },
        { status: 400 }
      );
    }

    // 2️⃣ UPDATE STATUS
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transaksi!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[cleanStatus]] },
    });

    // 3️⃣ AUDIT LOG
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

    console.log(`✅ Status ${cleanInvoice} updated: ${oldStatus} → ${cleanStatus} by ${adminEmail}`);

    return NextResponse.json({ 
      success: true,
      message: `Status berhasil diubah dari ${oldStatus} ke ${cleanStatus}`
    });
  } catch (err: any) {
    console.error("❌ Update status error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
