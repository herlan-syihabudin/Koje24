import { NextResponse } from "next/server"
import { google } from "googleapis"

const toNumber = (v: string): number => {
  if (!v) return 0
  // nilai seperti "10%" atau "15%"
  if (v.includes("%")) return Number(v.replace("%", "").trim())
  // nilai seperti "Rp50.000" atau "50000"
  return Number(v.replace(/\D/g, "")) || 0
}

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GS_CLIENT_EMAIL,
        private_key: process.env.GS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GS_SHEET_ID
    const range = "Kode Promo!A2:F200"

    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const rows = res.data.values || []

    const promos = rows
      .map((r) => ({
        kode: (r?.[0] || "").trim().toUpperCase(),
        tipe: (r?.[1] || "").trim(),          // Diskon / Potongan / Free Ongkir / Cashback
        nilai: toNumber(r?.[2] || ""),        // persen / rupiah otomatis jadi number
        minimal: toNumber(r?.[3] || ""),      // minimal belanja
        maxDiskon:
          !r?.[4] || r?.[4] === "-" ? null : toNumber(r[4]),
        status: (r?.[5] || "").trim(),
      }))
      // ⬇ Hanya promo aktif
      .filter((r) => r.status.toLowerCase() === "aktif")

    return NextResponse.json({
      success: true,
      promos,
      total: promos.length,
    })
  } catch (err: any) {
    console.error("API PROMOS ERROR:", err)
    return NextResponse.json(
      { success: false, message: err?.message ?? "Gagal memuat promo" },
      { status: 500 }
    )
  }
}
