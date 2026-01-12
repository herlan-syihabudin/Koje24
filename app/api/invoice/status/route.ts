import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =======================
   TYPE
======================= */
type InvoiceStatus = "Pending" | "Paid" | "COD" | "Cancelled";

/* =======================
   ENV
======================= */
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n");

const SHEET_NAME = "Transaksi";
const RANGE = `${SHEET_NAME}!A2:Q`;

/* =======================
   HELPERS
======================= */
function now() {
  return new Date().toLocaleString("id-ID");
}

function normStatus(s: string): InvoiceStatus {
  const t = String(s || "").trim().toUpperCase();
  if (t === "PAID" || t === "LUNAS") return "Paid";
  if (t === "COD") return "COD";
  if (t === "CANCEL" || t === "CANCELLED") return "Cancelled";
  return "Pending";
}

function getBaseUrl(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`
  );
}

function assertEnv() {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID kosong");
  if (!CLIENT_EMAIL) throw new Error("GOOGLE_CLIENT_EMAIL kosong");
  if (!PRIVATE_KEY_RAW) throw new Error("GOOGLE_PRIVATE_KEY kosong");
}

/* =========================================================
   POST → UPDATE STATUS (TELEGRAM / DASHBOARD / SHEET)
========================================================= */
export async function POST(req: NextRequest) {
  try {
    assertEnv();

    const { invoiceId, status } = await req.json();
    const inv = String(invoiceId || "").trim();
    if (!inv) {
      return NextResponse.json(
        { success: false, message: "invoiceId kosong" },
        { status: 400 }
      );
    }

    const nextStatus: InvoiceStatus = normStatus(status);

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(r => String(r?.[0] || "").trim() === inv);
    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = idx + 2;
    const row = rows[idx];

    const oldStatus: InvoiceStatus = normStatus(row[12]);
    const invoiceUrl = String(row[13] || "").trim();
    const email = String(row[14] || "").trim();
    const invoiceSentAt = String(row[16] || "").trim();

    /* ==============================
       🔒 LEVEL 2 GLOBAL RULE
    =============================== */

    // Cancelled = mati total
    if (oldStatus === "Cancelled") {
      return NextResponse.json(
        { success: false, message: "Invoice CANCELLED (terkunci)" },
        { status: 409 }
      );
    }

    // Paid → tidak boleh downgrade
    if (oldStatus === "Paid" && nextStatus !== "Paid") {
      return NextResponse.json(
        { success: false, message: "Invoice PAID (terkunci)" },
        { status: 409 }
      );
    }

    // Paid → Paid (idempotent)
    if (oldStatus === "Paid" && nextStatus === "Paid") {
      return NextResponse.json({
        success: true,
        invoiceId: inv,
        oldStatus,
        nextStatus,
        message: "No-op (sudah PAID)",
      });
    }

    /* ==============================
       UPDATE STATUS (SHEET)
    =============================== */
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[nextStatus]] },
    });

    /* ==============================
       SEND INVOICE EMAIL (ONCE)
    =============================== */
    const becomesPaid = oldStatus !== nextStatus && nextStatus === "Paid";

    if (becomesPaid && email && invoiceUrl && !invoiceSentAt) {
      const baseUrl = getBaseUrl(req);

      const send = await fetch(`${baseUrl}/api/send-invoice-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          invoiceId: inv,
          invoiceUrl,
        }),
      });

      const jr = await send.json().catch(() => ({}));
      if (!send.ok || !jr?.success) {
        return NextResponse.json(
          { success: false, message: "Gagal kirim invoice email" },
          { status: 500 }
        );
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!Q${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [[now()]] },
      });
    }

    return NextResponse.json({
      success: true,
      invoiceId: inv,
      oldStatus,
      nextStatus,
    });
  } catch (e: any) {
    console.error("INVOICE STATUS ERROR:", e);
    return NextResponse.json(
      { success: false, message: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
