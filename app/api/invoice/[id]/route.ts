import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const invoiceId = context.params.id?.trim();
    if (!invoiceId) {
      return NextResponse.json({ success: false, message: "Invoice ID kosong" });
    }

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A:N",
    });

    const rows = res.data.values ?? [];
    const match = rows.find((r) => (r?.[0] || "").trim() === invoiceId);

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "Invoice tidak ditemukan",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        timestamp: match[1] ?? "",
        nama: match[2] ?? "",
        hp: match[3] ?? "",
        alamat: match[4] ?? "",
        produkList: match[5] ?? "",
        qtyTotal: Number(match[6] ?? 0),
        subtotalCalc: Number(match[7] ?? 0),
        effectiveOngkir: Number(match[8] ?? 0),
        effectiveGrandTotal: Number(match[9] ?? 0),
        promoRaw: match[10] ?? "",
        paymentLabel: match[11] ?? "Transfer",
        status: match[12] ?? "Pending",
        invoiceUrl: match[13] ?? "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat invoice",
        detail: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}
