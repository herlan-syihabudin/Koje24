import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.SHEET_ID!;
const SERVICE_KEY = process.env.GOOGLE_SERVICE_KEY!;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!;

if (!SHEET_ID || !SERVICE_KEY || !PRIVATE_KEY) {
  console.error("❌ SHEET_ID / GOOGLE_SERVICE_KEY / GOOGLE_PRIVATE_KEY missing!");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const credentials = {
      ...JSON.parse(SERVICE_KEY),
      private_key: PRIVATE_KEY,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"),
            body.invoiceId,
            body.name,
            body.phone,
            body.address,
            JSON.stringify(body.items),
            body.total,
            "PENDING",
            "BANK",
            "",
            body.invoiceUrl,
          ],
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR ORDER:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
