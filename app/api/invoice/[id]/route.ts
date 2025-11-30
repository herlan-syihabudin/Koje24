import { NextResponse, NextRequest } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n")

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // ⬅️ HARUS pakai await di Next.js 16
    const invoiceId = id?.trim();
    if (!invoiceId) {
      return NextResponse.json({ success: false, message: "Invoice ID kosong" })
    }

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
    const match = rows.find(r => (r[1] || "").trim() === invoiceId)
    if (!match) {
      return NextResponse.json({ success: false, message: "Invoice tidak ditemukan" })
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        timestamp: match[0] ?? "",
        nama: match[2] ?? "",
        hp: match[3] ?? "",
        alamat: match[4] ?? "",
        produkList: match[5] || "",
        qtyTotal: Number(match[6] || 0),
        subtotalCalc: Number(match[7] || 0),
        status: match[8] || "Pending",
        paymentLabel: match[9] || "Transfer",
        effectiveOngkir: Number(match[10] || 0),
        effectiveGrandTotal: Number(match[11] || 0),
        invoiceUrl: match[12] || "",
      }
    })

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    )
  }
}
