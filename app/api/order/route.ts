// app/api/order/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SHEET_ID = process.env.SHEET_ID
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://webkoje-cacs.vercel.app"

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

    // 🔹 Generate Invoice ID & Link
    const invoiceId = `INV-${Date.now()}`
    const invoiceLink = `${BASE_URL}/invoice/${invoiceId}`

    const client = await auth.getClient()
    const sheets = google.sheets({ version: "v4", auth: client as any })

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID || "",
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            timestamp,        // A: Timestamp
            invoiceId,        // B: InvoiceID
            nama,             // C: Nama
            hp || "-",        // D: Hp
            alamat,           // E: Alamat
            produk,           // F: Produk
            total,            // G: Total
            "Pending",        // H: Status
            "Manual",         // I: PaymentMethod
            "",               // J: BankInfo
            invoiceLink,      // K: LinkInvoice
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceLink,
    })
  } catch (err: any) {
    console.error("API /api/order error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
