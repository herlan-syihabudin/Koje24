import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

async function getOrder(invoiceId: string) {
  if (!invoiceId) {
    console.log("❌ invoiceId kosong / undefined")
    return null
  }

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

  const row = rows.find(r => {
    const sheetId = (r[1] || "").trim()
    return sheetId === invoiceId.trim()
  })

  if (!row) return null

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: Number(row[6] ?? 0),
    total: Number(row[7] ?? 0),
    status: row[8] ?? "Pending",
    paymentMethod: row[9] ?? "",
    bankInfo: row[10] ?? "",
    linkInvoice: row[11] ?? "",
  }
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const data = await getOrder(params.id)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-center text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan 👀
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <h1 className="text-xl font-bold text-[#0B4B50] mb-1">
          Invoice #{data.invoiceId}
        </h1>
        <p className="text-sm text-gray-500 mb-4">{data.timestamp}</p>

        <p className="font-semibold">{data.nama}</p>
        <p className="text-gray-600">{data.hp}</p>
        <p className="text-gray-600 mb-4">{data.alamat}</p>

        <div className="border-t pt-3 mt-3">
          <p className="font-semibold">Pesanan:</p>
          <p className="text-sm">{data.produk}</p>
        </div>

        <div className="flex justify-between border-t pt-4 mt-4 text-lg">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-[#0B4B50]">
            Rp{data.total.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="mt-4 text-sm">
          Status:{" "}
          <span className="font-bold text-yellow-600">{data.status}</span>
        </div>
      </div>
    </main>
  )
}
