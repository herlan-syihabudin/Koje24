import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GS_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GS_PRIVATE_KEY ?? "";
    const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n");

    if (!CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error("Missing GS_CLIENT_EMAIL or GS_PRIVATE_KEY");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GS_SHEET_ID ?? "";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Transaksi!A2:K",
    });

    const rows = res.data.values ?? [];

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("API TRANSAKSI ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
