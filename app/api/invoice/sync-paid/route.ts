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
const RANGE = `${SHEET_NAME}!A2:Q`;

function now() {
  return new Date().toLocaleString("id-ID");
}

function getBaseUrl(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY_RAW) {
      throw new Error("ENV Google Sheet belum lengkap");
    }

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
    const baseUrl = getBaseUrl(req);

    let sentCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const invoiceId = String(row[0] || "").trim();   // A
      const status = String(row[12] || "").trim();     // M
      const invoiceUrl = String(row[13] || "").trim(); // N
      const email = String(row[14] || "").trim();      // O
      const sentAt = String(row[16] || "").trim();     // Q

      if (
        status === "Paid" &&
        !sentAt &&
        email &&
        invoiceUrl &&
        invoiceId
      ) {
        const send = await fetch(`${baseUrl}/api/send-invoice-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            nama: "-",
            invoiceId,
            invoiceUrl,
          }),
        });

        const jr = await send.json().catch(() => ({}));
        if (!send.ok || !jr?.success) {
          console.error(`❌ Gagal kirim invoice ${invoiceId}`);
          continue;
        }

        // update kolom Q (InvoiceEmailSentAt)
        const sheetRow = i + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!Q${sheetRow}`,
          valueInputOption: "RAW",
          requestBody: { values: [[now()]] },
        });

        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      message: `Sync selesai. ${sentCount} invoice terkirim.`,
    });
  } catch (err: any) {
    console.error("SYNC PAID ERROR:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Sync gagal" },
      { status: 500 }
    );
  }
}
