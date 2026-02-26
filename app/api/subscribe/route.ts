import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL

const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY
const PRIVATE_KEY = PRIVATE_KEY_RAW
  ? PRIVATE_KEY_RAW.replace(/\\n/g, "\n")
  : undefined

export async function POST(req: NextRequest) {
  try {

    // TARO DI SINI
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, message: "Google credentials not configured" },
        { status: 500 }
      )
    }
    const { email, source = "checkout" } = await req.json()

    const cleanEmail = String(email || "").toLowerCase().trim()
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ success: false, message: "Email invalid" })
    }

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Ambil semua subscriber
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:F",
    })

    const rows = res.data.values || []
    let rowIndex = -1


    rows.forEach((row, i) => {
      if (String(row[0]).toLowerCase() === cleanEmail) {
        rowIndex = i + 2
      }
    })

    const now = new Date().toISOString().replace("T", " ").slice(0, 19)

    // 🔁 EMAIL SUDAH ADA → AKTIFKAN ULANG
    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `SUBSCRIBERS!B${rowIndex}:F${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "TRUE",        // active
            source,        // source
            rows[rowIndex - 2][3], // created_at (jangan ubah)
            "RESUBSCRIBE", // last_action
            now            // updated_at
          ]],
        },
      })

      return NextResponse.json({ success: true, message: "Re-subscribed" })
    }

    // ➕ EMAIL BARU
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          cleanEmail,
          "TRUE",
          source,
          now,
          "SUBSCRIBE",
          ""
        ]],
      },
    })

    return NextResponse.json({ success: true, message: "Subscribed" })
  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
