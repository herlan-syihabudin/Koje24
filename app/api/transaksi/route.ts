import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GS_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GS_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GS_SHEET_ID ?? "";

    const PRIVATE_KEY = PRIVATE_KEY_RAW
      .replace(/\\n/g, "\n")
      .replace(/\\\\n/g, "\n");

    if (!CLIENT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
      throw new Error("Missing GS_CLIENT_EMAIL or GS_PRIVATE_KEY or GS_SHEET_ID");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:K",
    });

    const rows = res.data.values ?? [];

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("API TRANSAKSI ERROR:", err?.message ?? err);
    return NextResponse.json([], { status: 200 });
  }
}
