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

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      throw new Error("Body JSON tidak valid")
    }

    const {
      nama,
      hp,
      alamat,
      note,
      catatan,
      payment,
      cart,
      mapsUrl,
      distanceKm,
      shippingCost,
      ongkir,
      grandTotal,
      subtotal,
    } = body

    if (!nama || !hp || !alamat) {
      throw new Error("Data customer belum lengkap")
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("Cart kosong!")
    }

    // ============================
    // PRODUK & SUBTOTAL
    // ============================
    const produkList = cart.map((x: any) => `${x.name} (${x.qty}x)`).join(", ")
    const qtyTotal = cart.reduce(
      (a: number, x: any) => a + Number(x.qty || 0),
      0
    )

    const subtotalCalc =
      typeof subtotal === "number"
        ? subtotal
        : cart.reduce(
            (a: number, x: any) =>
              a + Number(x.price || 0) * Number(x.qty || 0),
            0
          )

    // ============================
    // ONGKIR & GRAND TOTAL
    // ============================
    const effectiveOngkir =
      typeof ongkir === "number"
        ? ongkir
        : typeof shippingCost === "number"
        ? shippingCost
        : 15000 // fallback kalau gak ada ongkir, pakai 15k

    const effectiveGrandTotal =
      typeof grandTotal === "number"
        ? grandTotal
        : subtotalCalc + effectiveOngkir

    // ============================
    // METODE PEMBAYARAN
    // ============================
    let paymentLabel = "Transfer"
    if (payment === "qris") paymentLabel = "QRIS"
    else if (payment === "cod") paymentLabel = "COD"

    // ============================
    // BUAT INVOICE ID + URL
    // ============================
    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    const host = req.nextUrl.host
    const protocol = req.nextUrl.protocol
    const baseUrl = `${protocol}//${host}`

    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    // ============================
    // GOOGLE SHEET
    // ============================
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Struktur kolom:
    // A: Timestamp
    // B: Invoice ID
    // C: Nama
    // D: HP
    // E: Alamat
    // F: Produk
    // G: Qty Total
    // H: Subtotal
    // I: Status
    // J: Metode Bayar
    // K: Ongkir
    // L: Grand Total
    // M: Invoice URL
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:M",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"), // A
            invoiceId, // B
            nama, // C
            hp, // D
            alamat, // E
            produkList, // F
            qtyTotal, // G
            subtotalCalc, // H
            "Pending", // I
            paymentLabel, // J
            effectiveOngkir, // K
            effectiveGrandTotal, // L
            invoiceUrl, // M
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
