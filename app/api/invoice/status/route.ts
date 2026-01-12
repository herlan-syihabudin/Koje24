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
const RANGE = `${SHEET_NAME}!A2:Q`; // sampai kolom Q

/* =======================
   HELPER
======================= */
function now() {
  return new Date().toLocaleString("id-ID");
}

function normStatus(s: string) {
  const t = String(s || "").trim().toUpperCase();
  if (t === "PAID" || t === "LUNAS") return "PAID";
  if (t === "COD") return "COD";
  if (t === "CANCEL" || t === "CANCELLED") return "CANCELLED";
  return "PENDING";
}

/* =========================================================
   GET → READ ONLY (dipakai invoice page / user)
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

    const res = await fetch(`${req.nextUrl.origin}/api/invoice/${invoiceId}`);
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
      detail: err?.message ?? err,
    });
  }
}

/* =========================================================
   POST → UPDATE STATUS (ADMIN / BOT / GOOGLE SHEET)
   - update kolom status
   - kirim invoice email HANYA SEKALI saat PAID
========================================================= */
export async function POST(req: NextRequest) {
  try {
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
    const idx = rows.findIndex(
      (r) => String(r?.[0] || "").trim() === inv
    );

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = idx + 2; // karena mulai dari A2
    const row = rows[idx] || [];

    const oldStatus = normStatus(row[12] || ""); // kolom M
    const invoiceUrl = String(row[13] || "").trim(); // N
    const email = String(row[14] || "").trim(); // O
    const invoiceSentAt = String(row[16] || "").trim(); // Q

    // 1️⃣ update status
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!M${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextStatus]],
      },
    });

    // 2️⃣ kirim invoice email JIKA:
    // - status berubah jadi PAID
    // - belum pernah dikirim
    const becomesPaid =
      oldStatus !== "PAID" && nextStatus === "PAID";

    if (becomesPaid && email && invoiceUrl && !invoiceSentAt) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get(
          "host"
        )}`;

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
          { success: false, message: "Gagal kirim invoice email" },
          { status: 500 }
        );
      }

      // tandai sudah dikirim
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!Q${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[now()]],
        },
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
