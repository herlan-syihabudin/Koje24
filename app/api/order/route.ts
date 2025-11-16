// app/api/order/route.ts
import { google } from "googleapis"
import { NextResponse } from "next/server"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SERVICE_KEY = process.env.GOOGLE_PRIVATE_KEY

if (!SHEET_ID || !SERVICE_KEY) {
  console.error("❌ SHEET_ID atau GOOGLE_PRIVATE_KEY tidak ada di environment!")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(SERVICE_KEY!),
      scopes: SCOPES,
    })

    const client = await auth.getClient()
    // 🔥 FIX TypeScript typing error
    const sheets = google.sheets({ version: "v4", auth: auth as any })

    const timestamp = new Date().toLocaleString("id-ID")
    const invoiceId = `INV-${Date.now()}`

    const values = [
      [
        timestamp,
        invoiceId,
        body.nama,
        body.hp,
        body.alamat,
        body.produkText,
        body.totalQty.toString(),
        body.totalPrice.toString(),
        "Pending",
        "Manual Transfer",
        "-",
        `https://webkoje-cacs.vercel.app/invoice/${invoiceId}`,
      ],
    ]

    // Simpan ke Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    })

    return NextResponse.json({
      success: true,
      invoiceId,
    })
  } catch (err) {
    console.error("❌ ERROR ORDER:", err)
    return NextResponse.json(
      { success: false, message: "Gagal mengirim order" },
      { status: 500 }
    )
  }
}
