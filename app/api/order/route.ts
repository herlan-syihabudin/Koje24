import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

const PRIVATE_KEY = PRIVATE_KEY_RAW
  .replace(/\\n/g, "\n")
  .replace(/\\\\n/g, "\n")

export async function POST(req: Request) {
  try {
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error("Environment Google Sheet belum lengkap")
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      throw new Error("Body JSON tidak valid")
    }

    const { nama, hp, alamat, produk, qty, total } = body

    if (!nama || !hp || !alamat) {
      throw new Error("Data customer belum lengkap")
    }

    // === FIX UTAMA — CartPopup tidak kirim cart, tapi kirim produk+qty+total
    if (!produk || !qty || qty === 0) {
      throw new Error("Cart kosong!")
    }

    // Generate invoice
    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    const baseUrl =
      req.headers.get("origin") || "https://webkoje-cacs.vercel.app"

    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    // === AUTH GOOGLE SHEET ===
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // === APPEND ORDER ===
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:L",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"),
            invoiceId,
            nama,
            hp,
            alamat,
            produk,
            qty,
            total,
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
