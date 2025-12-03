// lib/promos.ts
import { google } from "googleapis"

export type Promo = {
  kode: string
  tipe: "Diskon" | "Potongan" | "Free Ongkir" | "Cashback"
  nilai: number
  minimal: number
  maxDiskon: number | null
  status: string
}

// ⛏️ helper: konversi Rp & % jadi angka murni
const toNumber = (v: string): number => {
  if (!v) return 0
  if (v.includes("%")) return Number(v.replace("%", "").trim())
  return Number(v.replace(/\D/g, "")) || 0
}

export async function fetchPromos(): Promise<Promo[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GS_CLIENT_EMAIL,
        private_key: process.env.GS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const sheetId = process.env.GS_SHEET_ID!
    const range = "Kode Promo!A2:F200"

    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
    const rows = res.data.values || []

    return rows.map((r) => ({
      kode: r[0],
      tipe: r[1],
      nilai: toNumber(r[2]),
      minimal: toNumber(r[3]),
      maxDiskon: r[4] === "-" || !r[4] ? null : toNumber(r[4]),
      status: r[5] || "Tidak Aktif",
    }))
  } catch (err) {
    console.error("Fetch promos ERROR:", err)
    return []
  }
}
