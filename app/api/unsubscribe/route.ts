import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL

const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY
const PRIVATE_KEY = PRIVATE_KEY_RAW
  ? PRIVATE_KEY_RAW.replace(/\\n/g, "\n")
  : undefined

export async function GET(req: NextRequest) {
  try {

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  return NextResponse.json(
    { success: false, message: "Google credentials not configured" },
    { status: 500 }
  )
}

    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Email invalid" })
    }

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:F",
    })

    const rows = res.data.values || []
    let rowIndex = -1

    rows.forEach((row, i) => {
      if (String(row[0]).toLowerCase() === email) {
        rowIndex = i + 2
      }
    })

    if (rowIndex === -1) {
      return NextResponse.json({ success: true, message: "Email tidak ditemukan" })
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19)

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `SUBSCRIBERS!B${rowIndex}:F${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "FALSE",
          rows[rowIndex - 2][2],
          rows[rowIndex - 2][3],
          "UNSUBSCRIBE",
          now
        ]],
      },
    })

    return NextResponse.json({ success: true, message: "Unsubscribed" })
  } catch (err) {
    console.error("UNSUBSCRIBE ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
