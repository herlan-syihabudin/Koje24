import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

const HARGA_ONGKIR = 15000
const KONTAK_CS = "6282213139580"

const normalize = (v: any) => String(v || "").trim().toLowerCase()

async function getOrder(invoiceId: string) {
  const clean = normalize(invoiceId)
  if (!clean) return null

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A2:L999",
  })

  const rows = res.data.values || []

  const row =
    rows.find((r) => normalize(r[1]) === clean) ||
    rows.find((r) => normalize(r[11]).includes(clean))

  if (!row) return null

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: Number(row[6]) || 0,
    subtotal: Number(row[7]) || 0,
    status: row[8] ?? "Pending",
    paymentMethod: "Transfer Bank Mandiri",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}

export default async function InvoicePage(props: any) {
  const rawId = Array.isArray(props.params.id)
    ? props.params.id[0]
    : props.params.id

  const idClean = rawId?.toString().trim() ?? ""

  if (!idClean) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">Invoice ID tidak valid 🚫</h2>
      </main>
    )
  }

  const data = await getOrder(idClean)
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">Invoice tidak ditemukan 🚫</h2>
      </main>
    )
  }

  const safeSubtotal = Number(data.subtotal) || 0
  const safeQty = Number(data.qty) || 1
  const pricePerItem = Math.round(safeSubtotal / safeQty)

  const grandTotal = safeSubtotal + HARGA_ONGKIR
  const statusClasses = getStatusColor(data.status)

  // ⬇ lanjutkan kode UI lu yang sudah ada, aman ⬇
  return (
    ...
  )
}
