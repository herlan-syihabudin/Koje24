import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.PROMOS_SHEET_ID!,
      range: "Promo!A2:F100",
    })

    const values = res.data.values || []
    const promos = values.map((v) => ({
      judul: v[0],
      tipe: v[1],
      nilai: v[2],
      kode: v[3],
      status: v[4],
      aktifSampai: v[5],
    }))

    return NextResponse.json(promos)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
