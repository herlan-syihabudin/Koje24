// app/api/order/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SHEET_ID = process.env.SHEET_ID

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}"),
  scopes: SCOPES,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nama, hp, alamat, produk, total } = body

    const now = new Date()
    const timestamp = now.toLocaleString("id-ID")

    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() })

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            timestamp, // Timestamp
            `INV-${Date.now()}`, // InvoiceID unik
            nama,
            hp,
            alamat,
            produk,
            total,
            "Pending",
            "Manual",
            "",
            "", // LinkInvoice (step berikutnya)
          ],
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
