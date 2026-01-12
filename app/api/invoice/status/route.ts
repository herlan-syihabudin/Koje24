import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =======================
   TYPE
======================= */
type InvoiceStatus = "PENDING" | "PAID" | "COD" | "CANCELLED";

/* =======================
   ENV
======================= */
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";

// normalize private key (handle \n & \\n)
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

const SHEET_NAME = "Transaksi";
const RANGE = `${SHEET_NAME}!A2:Q`;

/* =======================
   HELPERS
======================= */
function now() {
  return new Date().toLocaleString("id-ID");
}

function normStatus(s: any): InvoiceStatus {
  const t = String(s ?? "").trim().toUpperCase();

  if (t === "PAID" || t === "LUNAS") return "PAID";
  if (t === "COD") return "COD";
  if (t === "CANCEL" || t === "CANCELLED") return "CANCELLED";
  if (t === "PENDING") return "PENDING";

  return "PENDING";
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
   - status diseragamkan ke UPPERCASE
   - lock rule: CANCELLED terkunci, PAID tidak boleh downgrade
   - idempotent: jika sama, return success no-op
   - kirim invoice email hanya sekali saat menjadi PAID
========================================================= */
export async function POST(req: NextRequest) {
  try {
    assertEnv();

    const body = await req.json().catch(() => ({}));
    const inv = String(body?.invoiceId || "").trim();
    if (!inv) {
      return NextResponse.json(
        { success: false, message: "invoiceId kosong" },
        { status: 400 }
      );
    }

    const nextStatus: InvoiceStatus = normStatus(body?.status);

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ambil semua transaksi
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex((r) => String(r?.[0] || "").trim() === inv);

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = idx + 2;
    const row = rows[idx] || [];

    // M=12 status, N=13 invoiceUrl, O=14 email, Q=16 invoiceEmailSentAt
    const oldStatus: InvoiceStatus = normStatus(row[12]);
    const invoiceUrl = String(row[13] || "").trim();
    const email = String(row[14] || "").trim();
    const invoiceSentAt = String(row[16] || "").trim();

    /* ==============================
       🔒 LEVEL 2 GLOBAL RULE
    =============================== */

    // Cancelled = mati total
    if (oldStatus === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "Invoice CANCELLED (terkunci)" },
        { status: 409 }
      );
    }

    // Paid → tidak boleh downgrade
    if (oldStatus === "PAID" && nextStatus !== "PAID") {
      return NextResponse.json(
        { success: false, message: "Invoice PAID (terkunci)" },
        { status: 409 }
      );
    }

    // idempotent
    if (oldStatus === nextStatus) {
      return NextResponse.json({
        success: true,
        invoiceId: inv,
        oldStatus,
        nextStatus,
        message: "No-op (status sama)",
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
       hanya saat berubah → PAID
    =============================== */
    const becomesPaid = oldStatus !== "PAID" && nextStatus === "PAID";

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
          { success: false, message: jr?.message || "Gagal kirim invoice email" },
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
      { success: false, message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
