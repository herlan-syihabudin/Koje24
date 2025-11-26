import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

const PRIVATE_KEY = PRIVATE_KEY_RAW
  .replace(/\\n/g, "\n")
  .replace(/\\\\n/g, "\n")

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, status } = await req.json()

    if (!invoiceId || !status) throw new Error("invoiceId & status wajib")

    const NEW_STATUS = String(status).toUpperCase() // konsisten

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Ambil semua data dulu (termasuk header)
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:M",
    })

    const rows = sheetData.data.values || []
    let rowNumber: number | null = null

    // Mulai loop dari index 1 (lewati header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]

      if (!row) continue

      const idColB = String(row[1] || "").trim()
      const urlColM = String(row[12] || "").trim()

      if (idColB === invoiceId || urlColM.includes(invoiceId)) {
        rowNumber = i + 1 // rumus Google Sheet row index
        break
      }
    }

    if (!rowNumber) throw new Error("Invoice tidak ditemukan")

    // Kolom I adalah STATUS
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[NEW_STATUS]] },
    })

    return NextResponse.json({
      success: true,
      message: `Status invoice ${invoiceId} diupdate menjadi ${NEW_STATUS}`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || String(err) },
      { status: 500 }
    )
  }
}
