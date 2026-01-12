import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =======================
   ENV
======================= */
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

const SHEET_NAME = "Transaksi";
const RANGE = `${SHEET_NAME}!A2:Q`; // A..Q

/* =======================
   HELPER
======================= */
function now() {
  return new Date().toLocaleString("id-ID");
}

/**
 * Konsisten dengan sheet: Pending / Paid / COD / Cancelled
 */
function normStatus(s: string) {
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
  if (!SHEET_ID) throw new Error("ENV GOOGLE_SHEET_ID kosong");
  if (!CLIENT_EMAIL) throw new Error("ENV GOOGLE_CLIENT_EMAIL kosong");
  if (!PRIVATE_KEY_RAW) throw new Error("ENV GOOGLE_PRIVATE_KEY kosong");
}

/* =========================================================
   GET → READ ONLY
   /api/invoice/status?id=INV-XXXX
========================================================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("id")?.trim();

    if (!invoiceId) {
      return NextResponse.json({
        success: false,
        message: "Parameter ?id= kosong",
      });
    }

    // Call endpoint resmi invoice kamu
    const res = await fetch(`${req.nextUrl.origin}/api/invoice/${invoiceId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        message: "Gagal mengambil data invoice",
      });
    }

    const json = await res.json();

    if (!json?.success || !json?.data) {
      return NextResponse.json({
        success: false,
        message: json?.message ?? "Invoice tidak ditemukan",
      });
    }

    const d = json.data;

    return NextResponse.json({
      success: true,
      invoiceId: d.invoiceId,
      status: d.status ?? "Unknown",
      paymentLabel: d.paymentLabel ?? "-",
      timestamp: d.timestamp ?? "",
      invoiceUrl: d.invoiceUrl ?? "",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal mengambil status invoice",
      detail: err?.message ?? String(err),
    });
  }
}

/* =========================================================
   POST → UPDATE STATUS (ADMIN / BOT / GOOGLE SHEET)
   - update kolom status
   - kirim invoice email HANYA SEKALI saat Paid
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

    const nextStatus = normStatus(status);

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

    const sheetRow = idx + 2; // karena mulai A2
    const row = rows[idx] || [];

    // index 0-based:
    // M = 12 status
    // N = 13 invoiceUrl
    // O = 14 email
    // Q = 16 invoiceEmailSentAt
    const oldStatus = normStatus(row[12] || "");
     // ==============================
// 🔒 LEVEL 2 GLOBAL LOCK
// ==============================
if (oldStatus === "Paid") {
  return NextResponse.json(
    {
      success: false,
      message: "Invoice sudah PAID dan terkunci",
    },
    { status: 409 }
  );
}

if (oldStatus === "Cancelled") {
  return NextResponse.json(
    {
      success: false,
      message: "Invoice sudah CANCELLED",
    },
    { status: 409 }
  );
}
    const invoiceUrl = String(row[13] || "").trim();
    const email = String(row[14] || "").trim();
    const invoiceSentAt = String(row[16] || "").trim();

    // 1) update status (kolom M)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[nextStatus]] },
    });

    // 2) kirim invoice email hanya saat berubah Pending->Paid dan belum pernah kirim
    const isStatusChanged = oldStatus !== nextStatus;
const becomesPaid = isStatusChanged && nextStatus === "Paid";

    if (becomesPaid && email && invoiceUrl && !invoiceSentAt) {
      const baseUrl = getBaseUrl(req);

      const send = await fetch(`${baseUrl}/api/send-invoice-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nama: "-",
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

      // tandai invoice email terkirim (kolom Q)
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
      { success: false, message: e?.message || "Error update status" },
      { status: 500 }
    );
  }
}
