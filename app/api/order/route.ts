import { google } from "googleapis"
import { NextResponse } from "next/server"

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      nama,
      hp,
      alamat,
      items,
      total
    } = body

    if (!items?.length) {
      return NextResponse.json({ error: "Cart kosong" }, { status: 400 })
    }

    const auth = new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      undefined,
      PRIVATE_KEY,
      ["https://www.googleapis.com/auth/spreadsheets"]
    )

    const sheets = google.sheets({ version: "v4", auth })

    const invoiceID = "INV-" + Date.now() // ID unik

    const rows = items.map((item: any) => [
      new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      invoiceID,
      nama,
      hp,
      alamat,
      item.name,
      item.qty,
      item.qty * item.price,
      "Pending",
      "Transfer Bank",
      "-",
      "-",
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:L",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    })

    return NextResponse.json({
      success: true,
      invoiceID,
    })
  } catch (err: any) {
    console.error("Order API ERROR:", err)
    return NextResponse.json(
      { error: "Order gagal dibuat", detail: err.message },
      { status: 500 }
    )
  }
}
