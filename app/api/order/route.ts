import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const invoiceId = "INV-" + Date.now()
    const invoiceUrl = `${req.headers.get("origin")}/invoice/${invoiceId}`

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:L",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"), // Timestamp
            invoiceId,
            body.nama,
            body.hp,
            body.alamat,
            body.produk,
            body.qty,
            body.total,
            "Pending",  // Status
            "Transfer", // Payment Method
            "-",        // Bank Info
            invoiceUrl  // 🔥 Link Invoice Tersimpan
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      invoiceUrl,
    })
  } catch (err) {
    console.error("❌ ERROR ORDER:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
