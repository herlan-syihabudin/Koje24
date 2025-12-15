import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim()

    if (!email || !email.includes("@")) {
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

    // Ambil semua subscriber
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:C",
    })

    const rows = res.data.values || []

    let rowIndex = -1
    rows.forEach((row, i) => {
      if (String(row[0]).toLowerCase() === email) {
        rowIndex = i + 2 // karena mulai dari A2
      }
    })

    if (rowIndex === -1) {
      return NextResponse.json({
        success: true,
        message: "Email sudah tidak aktif",
      })
    }

    // Update kolom ACTIVE → FALSE
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `SUBSCRIBERS!C${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["FALSE"]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Berhasil unsubscribe",
    })
  } catch (err) {
    console.error("UNSUBSCRIBE ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
