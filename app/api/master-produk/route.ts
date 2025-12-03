import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GS_CLIENT_EMAIL,
        private_key: process.env.GS_PRIVATE_KEY?.replace(/\\n/g, "\n")
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    })

    const sheets = google.sheets({ version: "v4", auth })
    const sheetId = process.env.SHEET_ID
    const range = "Master Produk!A2:F"

    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
    const rows = res.data.values || []

    const products = rows
      .filter(r => r[5] && r[5].toString().toLowerCase() === "true")
      .map(r => ({
        kode: r[0],
        nama: r[1],
        harga: Number(r[2]) || 0,
        promo: Number(r[3]) || 0,
        img: r[4] || "",
      }))

    return NextResponse.json(products)
  } catch (e) {
    console.error(e)
    return NextResponse.json([])
  }
}
