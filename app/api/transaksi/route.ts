import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    // Private key fix
    const PRIVATE_KEY = PRIVATE_KEY_RAW
      .replace(/\\n/g, "\n")
      .replace(/\\\\n/g, "\n");

    // Validasi ENV
    if (!CLIENT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
      throw new Error("Missing Google Sheet ENV (email / key / sheetId)");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Range dari A2 sampai K (sesuai sheet kamu)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:K",
    });

    const rows = res.data.values ?? [];

    // FE RatingPopup perlu array raw → jangan ubah struktur
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("API TRANSAKSI ERROR:", err?.message ?? err);
    return NextResponse.json([], { status: 200 });
  }
}
