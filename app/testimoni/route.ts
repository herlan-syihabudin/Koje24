import { NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")

// RANGE  — pastikan sesuai dengan sheet kamu
const RANGE = "Testimoni!A:F" 
// A = Timestamp
// B = Nama
// C = Kota
// D = Varian
// E = Pesan
// F = Rating
// G = ShowOnHome (opsional jika mau)

// ================================
// 🔹 AUTH GOOGLE SHEETS
// ================================
function getSheet() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  return google.sheets({ version: "v4", auth })
}

// ================================
// 🔹 GET (fetch semua testimoni)
// ================================
export async function GET() {
  try {
    const sheets = getSheet()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    })

    const rows = res.data.values || []

    // Buang header
    const body = rows.slice(1)

    const data = body.map((r) => ({
      timestamp: r[0] || "",
      nama: r[1] || "",
      kota: r[2] || "",
      varian: r[3] || "",
      pesan: r[4] || "",
      rating: Number(r[5] || 5),
      ShowOnHome: (r[6] || "").toString().trim().toLowerCase(), // TRUE/FALSE
    }))

    return NextResponse.json(data)
  } catch (err) {
    console.error("❌ ERROR GET TESTIMONI:", err)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

// ================================
// 🔹 POST (tambah testimoni baru)
// ================================
export async function POST(req: Request) {
  try {
    const { nama, kota, varian, pesan, rating, showOnHome } = await req.json()

    if (!nama || !pesan) {
      return NextResponse.json(
        { error: "Nama dan pesan wajib diisi" },
        { status: 400 }
      )
    }

    const rate = Math.max(1, Math.min(5, Number(rating) || 5))

    const sheets = getSheet()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID"),
            nama,
            kota || "",
            varian || "",
            pesan,
            rate,
            showOnHome ? "TRUE" : "FALSE",
          ],
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ ERROR POST TESTIMONI:", err)
    return NextResponse.json(
      { error: "Gagal menambah testimoni" },
      { status: 500 }
    )
  }
}
