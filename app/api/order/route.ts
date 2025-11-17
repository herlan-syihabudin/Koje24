import { NextResponse } from "next/server";
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID = process.env.SHEET_ID;

export async function POST(req: Request) {
  try {
    if (!SHEET_ID) {
      throw new Error("Missing SHEET_ID");
    }

    const body = await req.json();
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"),
            body.name,
            body.phone,
            body.address,
            JSON.stringify(body.items),
            body.total,
          ]
        ],
      },
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
