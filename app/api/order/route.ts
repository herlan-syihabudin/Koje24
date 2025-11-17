import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.SHEET_ID!;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!;

const auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  undefined,
  GOOGLE_PRIVATE_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sheets = google.sheets({ version: "v4", auth });

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
            body.total
          ]
        ],
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ ERROR ORDER:", error);
    return NextResponse.json({ error: true, message: String(error) }, { status: 500 });
  }
}
