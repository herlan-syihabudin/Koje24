import { NextResponse, NextRequest } from "next/server" // Ubah import menjadi NextRequest
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

const PRIVATE_KEY = PRIVATE_KEY_RAW
  .replace(/\\n/g, "\n")
  .replace(/\\\\n/g, "\n")

export async function POST(req: NextRequest) { // Gunakan NextRequest di sini
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

    const { nama, hp, alamat, cart } = body

    if (!nama || !hp || !alamat) {
      throw new Error("Data customer belum lengkap")
    }

    // === Validasi Cart ===
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("Cart kosong!")
    }

    const produkList = cart
      .map((x) => `${x.name} (${x.qty}x)`)
      .join(", ")

    const qtyTotal = cart.reduce((acc, x) => acc + x.qty, 0)
    const subtotal = cart.reduce((acc, x) => acc + (x.price * x.qty), 0)

    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase()
    
    // === BASE URL YANG LEBIH AKURAT ===
    const host = req.nextUrl.host;
    const protocol = req.nextUrl.protocol;
    const baseUrl = `${protocol}//${host}`; 

    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    // === GOOGLE SHEET ===
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
            new Date().toLocaleString("id-ID"), // Kolom A
            invoiceId,                          // Kolom B
            nama,
            hp,
            alamat,
            produkList,                         // Kolom F
            qtyTotal,                           // Kolom G
            subtotal,                           // Kolom H
            "Pending",                          // Kolom I
            "Transfer",                         // Kolom J
            "-",                                // Kolom K
            invoiceUrl,                         // Kolom L
          ],
        ],
      },
    })
    
    console.log(`✅ ORDER SUKSES: ID ${invoiceId} berhasil dicatat.`);
    console.log(`🔗 URL INVOICE: ${invoiceUrl}`);

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
