import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

console.log("🧪 ENV CHECK:", {
  SHEET_ID,
  CLIENT_EMAIL,
  PRIVATE_KEY_EXISTS: !!PRIVATE_KEY
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("📦 Incoming Order Body:", body)

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      console.error("❌ ENV variable missing!")
      return NextResponse.json(
        { success: false, message: "Server config error: Missing env" },
        { status: 500 }
      )
    }

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const invoiceId = "INV-" + Date.now()
    const origin = req.headers.get("origin") || "https://webkoje-cacs.vercel.app"
    const invoiceUrl = `${origin}/invoice/${invoiceId}`

    console.log("🧾 Creating Invoice:", invoiceUrl)

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:L",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"),
            invoiceId,
            body.nama,
            body.hp,
            body.alamat,
            body.produk,
            body.qty,
            body.total,
            "Pending",
            "Transfer",
            "-",
            invoiceUrl,
          ],
        ],
      },
    })

    console.log("✅ APPEND SUCCESS!")

    return NextResponse.json({
      success: true,
      invoiceUrl,
    })
  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err.message)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
