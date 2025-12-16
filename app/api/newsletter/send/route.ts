import { NextResponse } from "next/server"
import { google } from "googleapis"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

export async function POST() {
  try {
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:C",
    })

    const rows = res.data.values || []

    const emails = rows
      .filter(r => r[2] === "TRUE")
      .map(r => r[0])

    for (const email of emails) {
      await resend.emails.send({
        from: "KOJE24 <hello@koje24.id>",
        to: email,
        subject: "🌿 Tips Sehat Hari Ini dari KOJE24",
        html: `
          <h2>Halo dari KOJE24 👋</h2>
          <p>Jangan lupa minum juice sehat hari ini ya 🍹</p>
          <a href="https://koje24.id/unsubscribe?email=${email}">
            Unsubscribe
          </a>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("NEWSLETTER ERROR", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
