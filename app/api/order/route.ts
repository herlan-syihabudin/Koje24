import { NextResponse, NextRequest } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

// Bersihkan private key
const PRIVATE_KEY = PRIVATE_KEY_RAW
  .replace(/\\n/g, "\n")
  .replace(/\\\\n/g, "\n")

export async function POST(req: NextRequest) {
  try {
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error("Environment Google Sheet belum lengkap")
    }

    const body = await req.json()

    const {
      nama,
      hp,
      alamat,
      catatan,
      mapsUrl,
      cart,
      subtotal,
      ongkir,
      grandTotal,
      zone,
      distanceKm,
    } = body

    if (!nama || !hp || !alamat) {
      throw new Error("Data customer belum lengkap")
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("Cart kosong!")
    }

    // Buat list produk & hitung qty/subtotal dari server (lebih aman)
    const produkList = cart
      .map((x: any) => `${x.name} (${x.qty}x)`)
      .join(", ")

    const qtyTotal = cart.reduce(
      (a: number, x: any) => a + (Number(x.qty) || 0),
      0
    )

    const subtotalSafe = cart.reduce(
      (a: number, x: any) =>
        a + (Number(x.price) * Number(x.qty) || 0),
      0
    )

    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    // BASE URL
    const host = req.nextUrl.host
    const protocol = req.nextUrl.protocol
    const baseUrl = `${protocol}//${host}`

    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`

    // ============================
    // COMBINE INFO ONGKIR + LOKASI DI KOLOM CATATAN
    // ============================
    const parts: string[] = []

    if (catatan) parts.push(`Catatan: ${catatan}`)
    if (mapsUrl) parts.push(`Maps: ${mapsUrl}`)
    if (typeof distanceKm === "number")
      parts.push(`Jarak: ~${distanceKm.toFixed(1)} km`)
    if (zone) parts.push(`Zona: ${zone}`)
    if (typeof ongkir === "number")
      parts.push(`Ongkir: Rp${Number(ongkir).toLocaleString("id-ID")}`)
    if (typeof grandTotal === "number")
      parts.push(
        `Total+Ongkir: Rp${Number(grandTotal).toLocaleString("id-ID")}`
      )

    const noteCell = parts.length > 0 ? parts.join(" | ") : "-"

    // ============================
    // GOOGLE SHEET
    // Struktur lama dipertahankan: A–L
    // ============================
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
            new Date().toLocaleString("id-ID"), // A timestamp
            invoiceId,                          // B invoice
            nama,                               // C nama
            hp,                                 // D hp
            alamat,                             // E alamat
            produkList,                         // F produk
            qtyTotal,                           // G total qty
            subtotalSafe,                       // H subtotal produk
            "Pending",                          // I status
            "Manual",                           // J pembayaran (sementara "Manual")
            noteCell,                           // K berisi info ongkir + map + catatan
            invoiceUrl,                         // L link invoice
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
