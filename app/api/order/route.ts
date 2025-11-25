import { NextResponse, NextRequest } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

const PRIVATE_KEY = PRIVATE_KEY_RAW
  .replace(/\\n/g, "\n")
  .replace(/\\\\n/g, "\n")

export async function POST(req: NextRequest) {
  try {
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error("Environment Google Sheet belum lengkap")
    }

    const body = await req.json()
    const { nama, hp, alamat, note, payment, cart } = body

    if (!nama || !hp || !alamat) {
      throw new Error("Data customer belum lengkap")
    }

    if (!payment) {
      throw new Error("Metode pembayaran belum dipilih")
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("Cart kosong!")
    }

    const produkList = cart.map((x) => `${x.name} (${x.qty}x)`).join(", ")
    const qtyTotal = cart.reduce((a, x) => a + x.qty, 0)
    const subtotal = cart.reduce((a, x) => a + x.price * x.qty, 0)

    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    // BASE URL
    const host = req.nextUrl.host
    const protocol = req.nextUrl.protocol
    const baseUrl = `${protocol}//${host}`

    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    // ============================
    // METODE PEMBAYARAN
    // ============================
    let paymentLabel = "Transfer"
    let feeInfo = "-"

    if (payment === "qris") {
      paymentLabel = "QRIS"
      feeInfo = "0.7% (dummy)"
    }

    if (payment === "cod") {
      paymentLabel = "COD"
      feeInfo = "-"
    }

    // ============================
    // GOOGLE SHEET
    // ============================
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:M",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"), // A
            invoiceId,                          // B
            nama,                               // C
            hp,                                 // D
            alamat,                             // E
            produkList,                         // F
            qtyTotal,                           // G
            subtotal,                           // H
            "Pending",                          // I
            paymentLabel,                       // J
            feeInfo,                            // K
            note || "-",                        // L
            invoiceUrl                          // M
          ],
        ],
      },
    })

    console.log(`🟢 ORDER TERSIMPAN: ${invoiceId}`)
    console.log(`🔗 INVOICE URL: ${invoiceUrl}`)

    return NextResponse.json({
      success: true,
      invoiceUrl,
    })
  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err)
    return NextResponse.json(
      { success: false, message: err.message || String(err) },
      { status: 500 }
    )
  }
}
