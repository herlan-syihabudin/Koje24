import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/\\n/g, "\n") : ""

export async function POST(req: Request) {
  try {
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error("Environment variable Google Sheet belum lengkap")
    }

    const body = await req.json()

    const cart = body.cart
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("Cart kosong!")
    }

    if (cart.some((x) => !x.name || !x.qty || !x.price)) {
      throw new Error("Data cart tidak valid")
    }

    const produkList = cart
      .map((x) => `${x.name} (${x.qty}x)`)
      .join(", ")

    const totalQty = cart.reduce((acc, x) => acc + (x.qty || 0), 0)
    const subtotal = cart.reduce((acc, x) => acc + (x.qty * x.price || 0), 0)

    const baseUrl =
      req.headers.get("origin") || "https://webkoje-cacs.vercel.app"

    // FIXED: Invoice ID SHORT VERSION anti error
    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1", // SAFER
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"), // Tanggal
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
