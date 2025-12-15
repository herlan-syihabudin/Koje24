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
      return NextResponse.json({ success: false, message: "Email invalid" })
    }

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // 🔍 Ambil email yang sudah ada
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:A",
    })

    const emails =
      existing.data.values?.flat().map(e => String(e).toLowerCase()) || []

    // Kalau sudah ada → anggap sukses
    if (emails.includes(cleanEmail)) {
      return NextResponse.json({ success: true, message: "Already subscribed" })
    }

    const now = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)

    // ➕ Tambahkan subscriber
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[cleanEmail, source, "TRUE", now]],
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
