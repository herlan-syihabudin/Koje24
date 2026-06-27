// app/api/invoice/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

// 🔐 ENV
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";

// 🔐 Fix private key format
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ⬅️ WAJIB: Promise
) {
  try {
    const { id } = await context.params; // ⬅️ di-await
    const invoiceId = id?.trim();

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Invoice ID kosong" },
        { status: 400 }
      );
    }

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi Google Sheet belum lengkap" },
        { status: 500 }
      );
    }

    // 🔑 Auth Google Sheets (READ ONLY)
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A:O", // sampai kolom email
    });

    const rows = res.data.values ?? [];
    const row = rows.find((r) => (r?.[0] ?? "").trim() === invoiceId);

    if (!row) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = {
      invoiceId,
      timestamp: row[1] ?? "",
      nama: row[2] ?? "",
      hp: row[3] ?? "",
      alamat: row[4] ?? "",
      produkList: row[5] ?? "",
      qtyTotal: Number(row[6] ?? 0),
      subtotalCalc: Number(row[7] ?? 0),
      effectiveOngkir: Number(row[8] ?? 0),
      effectiveGrandTotal: Number(row[9] ?? 0),
      promoRaw: row[10] ?? "",
      paymentLabel: row[11] ?? "Transfer",
      status: row[12] ?? "Pending",
      invoiceUrl: row[13] ?? "",
      email: row[14] ?? "",
    };

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ INVOICE API ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat invoice",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
