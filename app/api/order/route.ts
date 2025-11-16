import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

/**
 * Helper: bikin client Google Sheets
 */
async function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Google Sheets env belum lengkap")
  }

  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    // penting: ganti \n jadi newline bener
    privateKey.replace(/\\n/g, "\n"),
    SCOPES
  )

  const sheets = google.sheets({ version: "v4", auth })

  return { sheets, spreadsheetId }
}

/**
 * Helper: bikin InvoiceID simple
 * Contoh: KOJE-20251116-1234
 */
function generateInvoiceId() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `KOJE-${datePart}-${rand}`
}

/**
 * POST /api/order
 * Body: { nama, hp?, alamat, catatan?, items, total }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      nama,
      hp,
      alamat,
      catatan,
      items,
      total,
    }: {
      nama: string
      hp?: string
      alamat: string
      catatan?: string
      items: { id: string; name: string; price: number; qty: number }[]
      total: number
    } = body

    if (!nama || !alamat || !items || !items.length) {
      return NextResponse.json(
        { ok: false, message: "Data order tidak lengkap" },
        { status: 400 }
      )
    }

    const { sheets, spreadsheetId } = await getSheetsClient()

    const now = new Date()
    const timestamp = now.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    })

    const invoiceId = generateInvoiceId()

    // Produk & Qty
    const produkText = items
      .map((i) => `${i.name} × ${i.qty}`)
      .join(", ")

    const totalQty = items.reduce((sum, i) => sum + i.qty, 0)

    // Default untuk kolom yang belum kita gunakan penuh
    const status = "Pending"
    const paymentMethod = "Transfer Bank"
    const bankInfo = "" // nanti kita isi misal: BCA 1234 a.n KOJE24
    const linkInvoice = "" // nanti kalau sudah punya PDF / link invoice

    // Urutan kolom:
    // Timestamp | InvoiceID | Nama | Hp | Alamat | Produk | Qty | Total | Status | PaymentMethod | BankInfo | LinkInvoice
    const row = [
      timestamp,
      invoiceId,
      nama,
      hp || "",
      alamat,
      produkText,
      totalQty,
      Number(total) || 0,
      status,
      paymentMethod,
      bankInfo,
      linkInvoice,
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A:Z", // pakai sheet pertama; kalau mau spesifik: 'Invoice!A:Z'
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    })

    return NextResponse.json({ ok: true, invoiceId })
  } catch (err: any) {
    console.error("Error /api/order:", err)
    return NextResponse.json(
      {
        ok: false,
        message: "Gagal menyimpan order ke Google Sheet",
        error: err?.message || String(err),
      },
      { status: 500 }
    )
  }
}
