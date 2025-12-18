import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

export async function POST(req: NextRequest) {
  try {
    const { email, source = "checkout" } = await req.json()

    const cleanEmail = String(email || "").toLowerCase().trim()
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email tidak valid" },
        { status: 400 }
      )
    }

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // 🔍 cek email existing
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:A",
    })

    const emails =
      existing.data.values?.flat().map(e => String(e).toLowerCase()) || []

    if (emails.includes(cleanEmail)) {
      return NextResponse.json({
        success: true,
        message: "Already subscribed",
      })
    }

    const now = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)

    // ➕ append subscriber (URUTAN KOLOM BENAR)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          cleanEmail, // A email
          "TRUE",     // B active
          source,     // C source
          now,        // D created_at
          "",         // E last_action
          "",         // F updated_at
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Subscribed",
    })
  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
