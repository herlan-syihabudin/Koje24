// app/api/dashboard/orders/close/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

/* =====================
   UTIL
===================== */
function parseTanggalSheet(raw: string) {
  if (!raw) return null;
  const datePart = String(raw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

// 🔥 TAMBAH COD & DIKIRIM
const ALLOWED_CLOSING_STATUS = ["PAID", "SELESAI", "COD", "DIKIRIM"];

/* =====================
   CLOSING ORDER
===================== */
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const { admin } = guard;
    const adminEmail = admin.email;

    const { from, to, status } = await req.json();

    if (!from || !to || !status) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const cleanStatus = String(status).toUpperCase();
    if (!ALLOWED_CLOSING_STATUS.includes(cleanStatus)) {
      return NextResponse.json(
        { success: false, message: "Status closing tidak valid" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const updates: any[] = [];
    const closedInvoices: string[] = [];

    rows.forEach((row, index) => {
      const invoice = String(row[0] || "").trim();
      const tanggalRaw = row[1];
      const orderStatus = String(row[12] || "").toUpperCase();
      const closed = String(row[15] || "").toUpperCase();

      if (!invoice) return;
      if (closed === "YES") return;
      if (orderStatus !== cleanStatus) return;

      const tanggal = parseTanggalSheet(tanggalRaw);
      if (!tanggal) return;

      if (tanggal >= fromDate && tanggal <= toDate) {
        updates.push({
          range: `Transaksi!P${index + 2}`,
          values: [["YES"]],
        });
        closedInvoices.push(invoice);
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        closedCount: 0,
        message: "Tidak ada order yang memenuhi syarat closing",
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Audit_Log!A:G",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          now(),
          "-",
          "CLOSING_ORDER",
          cleanStatus,
          `${from} → ${to}`,
          `${closedInvoices.length} order`,
          adminEmail,
        ]],
      },
    });

    console.log(`✅ Closing ${closedInvoices.length} orders by ${adminEmail}`);

    return NextResponse.json({
      success: true,
      closedCount: closedInvoices.length,
      invoices: closedInvoices,
    });
  } catch (err: any) {
    console.error("❌ Closing error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
