import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n")

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id?.trim()
    if (!invoiceId) return NextResponse.json({ success: false, message: "Invoice ID kosong" })

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:M",
    })

    const rows = res.data.values?.slice(1) || []
    const match = rows.find((r) => (r[1] || "").trim() === invoiceId)
    if (!match) return NextResponse.json({ success: false, message: "Invoice tidak ditemukan" })

    const produkList = match[5] || ""
    const qtyTotal = match[6] ? Number(match[6]) : 0
    const subtotalCalc = match[7] ? Number(match[7]) : 0
    const status = match[8] || "Pending"
    const paymentLabel = match[9] || "Transfer"
    const effectiveOngkir = match[10] ? Number(match[10]) : 0
    const effectiveGrandTotal = match[11] ? Number(match[11]) : 0
    const invoiceUrl = match[12] || ""

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        timestamp: match[0] ?? "",
        nama: match[2] ?? "",
        hp: match[3] ?? "",
        alamat: match[4] ?? "",
        produkList,
        qtyTotal,
        subtotalCalc,
        status,
        paymentLabel,
        effectiveOngkir,
        effectiveGrandTotal,
        invoiceUrl,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    )
  }
}
