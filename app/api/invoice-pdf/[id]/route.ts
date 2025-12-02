import { NextRequest, NextResponse } from "next/server"
import PDFDocument from "pdfkit"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n")

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id?.trim()
    if (!invoiceId) {
      return new NextResponse("Invoice ID kosong", { status: 400 })
    }

    // 🔥 Fetch data invoice dari Google Sheets
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
    const row = rows.find((r) => (r[1] || "").trim() === invoiceId)
    if (!row) {
      return new NextResponse("Invoice tidak ditemukan", { status: 404 })
    }

    const data = {
      invoiceId,
      timestamp: row[0] ?? "",
      nama: row[2] ?? "",
      hp: row[3] ?? "",
      alamat: row[4] ?? "",
      produkList: row[5] ?? "",
      qtyTotal: Number(row[6] ?? 0),
      subtotalCalc: Number(row[7] ?? 0),
      ongkir: Number(row[10] ?? 0),
      grandTotal: Number(row[11] ?? 0),
    }

    // 🔥 Generate PDF
    const doc = new PDFDocument({ margin: 40 })
    const chunks: Uint8Array[] = []
    doc.on("data", (c) => chunks.push(c))
    doc.on("end", () => {})

    doc.fontSize(20).text("📄 INVOICE KOJE24", { align: "center" })
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Tanggal      : ${data.timestamp}`)
    doc.text(`Invoice ID   : ${data.invoiceId}`)
    doc.text(`Nama         : ${data.nama}`)
    doc.text(`HP           : ${data.hp}`)
    doc.text(`Alamat       : ${data.alamat}`)
    doc.moveDown()

    doc.text(`Produk       : ${data.produkList}`)
    doc.text(`Qty Total    : ${data.qtyTotal}`)
    doc.text(`Subtotal     : Rp ${data.subtotalCalc.toLocaleString("id-ID")}`)
    doc.text(`Ongkir       : Rp ${data.ongkir.toLocaleString("id-ID")}`)
    doc.moveDown()
    doc.fontSize(14).text(`Grand Total  : Rp ${data.grandTotal.toLocaleString("id-ID")}`, { underline: true })
    doc.end()

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)))
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoiceId}.pdf"`,
      },
    })
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 })
  }
}
