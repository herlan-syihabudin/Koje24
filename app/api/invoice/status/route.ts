import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =======================
   TYPE
======================= */
type InvoiceStatus =
  | "PENDING"
  | "PAID"
  | "COD"
  | "DIPROSES"
  | "DIKIRIM"
  | "SELESAI"
  | "CANCELLED";

/* =======================
   ENV
======================= */
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

const SHEET_NAME = "Transaksi";
const RANGE = `${SHEET_NAME}!A2:Q`;

function now() {
  return new Date().toLocaleString("id-ID");
}

function normStatus(s: any): InvoiceStatus {
  const t = String(s ?? "").trim().toUpperCase();

  if (t === "PAID" || t === "LUNAS") return "PAID";
  if (t === "COD") return "COD";
  if (t === "DIPROSES") return "DIPROSES";
  if (t === "DIKIRIM") return "DIKIRIM";
  if (t === "SELESAI") return "SELESAI";
  if (t === "CANCEL" || t === "CANCELLED") return "CANCELLED";
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
   POST → UPDATE STATUS
   RULE LEVEL 2:
   - CANCELLED terkunci total
   - boleh naik tahap: PENDING → PAID/COD → DIPROSES → DIKIRIM → SELESAI
   - PAID tidak boleh balik ke PENDING
   - idempotent: status sama = no-op
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

    const nextStatus = normStatus(body?.status);

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
    const oldStatus = normStatus(row[12]);
    const invoiceUrl = String(row[13] || "").trim();
    const email = String(row[14] || "").trim();
    const invoiceSentAt = String(row[16] || "").trim();

    // 🔒 CANCELLED terkunci total
    if (oldStatus === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "Invoice CANCELLED (terkunci)" },
        { status: 409 }
      );
    }

    // ✅ idempotent
    if (oldStatus === nextStatus) {
      return NextResponse.json({
        success: true,
        invoiceId: inv,
        oldStatus,
        nextStatus,
        message: "No-op (status sama)",
      });
    }

    // 🔒 Aturan “tidak boleh downgrade”
    // urutan progres
    const rank: Record<InvoiceStatus, number> = {
      PENDING: 1,
      COD: 2,
      PAID: 2,
      DIPROSES: 3,
      DIKIRIM: 4,
      SELESAI: 5,
      CANCELLED: 99,
    };

    // Tidak boleh mundur (misal PAID → PENDING)
    if (rank[nextStatus] < rank[oldStatus]) {
      return NextResponse.json(
        { success: false, message: `Tidak boleh downgrade: ${oldStatus} → ${nextStatus}` },
        { status: 409 }
      );
    }

    // ✅ Update status di sheet (kolom M)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[nextStatus]] },
    });

    // ✅ Email invoice hanya sekali saat first time jadi PAID
    const becomesPaid = oldStatus !== "PAID" && nextStatus === "PAID";
    if (becomesPaid && email && invoiceUrl && !invoiceSentAt) {
      const baseUrl = getBaseUrl(req);

      const send = await fetch(`${baseUrl}/api/send-invoice-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, invoiceId: inv, invoiceUrl }),
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

    return NextResponse.json({ success: true, invoiceId: inv, oldStatus, nextStatus });
  } catch (e: any) {
    console.error("INVOICE STATUS ERROR:", e);
    return NextResponse.json(
      { success: false, message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
