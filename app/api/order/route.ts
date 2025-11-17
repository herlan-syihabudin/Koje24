import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const cart = body.cart || []
    if (!cart.length) {
      throw new Error("Cart kosong!")
    }

    const produkList = cart
      .map((x: any) => `${x.name} (${x.qty}x)`)
      .join(", ")

    const totalQty = cart.reduce(
      (acc: number, x: any) => acc + (x.qty || 0),
      0
    )

    const subtotal = cart.reduce(
      (acc: number, x: any) => acc + (x.qty * x.price || 0),
      0
    )

    const baseUrl =
      req.headers.get("origin") || "https://webkoje-cacs.vercel.app"

    const invoiceId = "INV-" + Date.now()
    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

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
            produkList,
            totalQty,
            subtotal,
            "Pending",
            "Transfer",
            "-",
            invoiceUrl,
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
    return NextResponse.json(
      { success: false, message: String(err) },
      { status: 500 }
    )
  }
}
