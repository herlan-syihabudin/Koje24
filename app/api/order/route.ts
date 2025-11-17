import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

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
          ],
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ ERROR ORDER:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
