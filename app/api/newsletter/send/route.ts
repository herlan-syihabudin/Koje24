import { NextResponse } from "next/server"
import { google } from "googleapis"
import nodemailer from "nodemailer"
import { newsletterTemplate } from "@/lib/email/newsletterTemplate"


export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

export async function POST() {
  try {
    // 🔐 Google Sheets auth
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "SUBSCRIBERS!A2:B", // email | active
    })

    const rows = res.data.values || []

    const emails = rows
      .filter(r => r[1] === "TRUE")
      .map(r => r[0])

    if (emails.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    // 📧 SMTP transporter (SAMA dengan invoice)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    let sent = 0

    for (const email of emails) {
      const html = `
        <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6;">
          <p>Halo 👋</p>
          <p>
            Jangan lupa jaga kesehatan hari ini ya 🍹  
            KOJE24 selalu pakai bahan segar & alami untuk kamu.
          </p>

          <p style="margin: 16px 0;">
            💡 <b>Tips hari ini:</b><br/>
            Minum juice pagi hari bantu metabolisme lebih optimal.
          </p>

          <p>
            Terima kasih sudah jadi bagian dari KOJE24 💚
          </p>

          <hr style="margin:24px 0;"/>

          <p style="font-size:12px; color:#666;">
            Kalau kamu sudah tidak ingin menerima email dari kami,  
            <a href="https://koje24.id/unsubscribe?email=${email}">
              klik di sini untuk unsubscribe
            </a>
          </p>
        </div>
      `

      await transporter.sendMail({
        from: process.env.EMAIL_FROM, // sama persis dengan invoice
        to: email,
        subject: "🌿 Tips Sehat dari KOJE24",
        html,
      })

      sent++
    }

    return NextResponse.json({
      success: true,
      sent,
    })
  } catch (err) {
    console.error("NEWSLETTER SMTP ERROR:", err)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}
