// app/invoice/[id]/page.tsx
import { google } from "googleapis"
import { SheetsOrder } from "@/types/order"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SERVICE_KEY = process.env.GOOGLE_PRIVATE_KEY

async function getOrderData(invoiceId: string): Promise<SheetsOrder | null> {
  if (!SHEET_ID || !SERVICE_KEY) {
    console.error("❌ SHEET_ID atau GOOGLE_PRIVATE_KEY tidak ditemukan!")
    return null
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(SERVICE_KEY),
    scopes: SCOPES,
  })

  const client = await auth.getClient()
  // 🔥 FIX yang sama untuk typing
  const sheets = google.sheets({ version: "v4", auth: auth as any })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A2:L999",
  })

  const rows = res.data.values || []
  const row = rows.find(r => r[1] === invoiceId)

  if (!row) return null

  return {
    timestamp: row[0],
    invoiceId: row[1],
    nama: row[2],
    hp: row[3],
    alamat: row[4],
    produk: row[5],
    qty: row[6],
    total: Number(row[7]),
    status: row[8],
    paymentMethod: row[9],
    bankInfo: row[10],
    linkInvoice: row[11],
  }
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const data = await getOrderData(params.id)

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f5f7f7] px-6 py-16 flex justify-center">
        <div className="max-w-lg w-full border rounded-xl shadow-md p-8 bg-white">
          <h1 className="text-xl font-bold text-red-500">Invoice tidak ditemukan</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f7f7] px-6 py-16 flex justify-center">
      <div className="max-w-lg w-full border rounded-2xl shadow-md p-8 bg-white">
        <h1 className="text-2xl font-bold text-[#0B4B50] mb-2">Invoice #{data.invoiceId}</h1>
        <p className="text-xs text-gray-500 mb-4">Dibuat: {data.timestamp}</p>

        <p className="text-sm font-semibold">{data.nama}</p>
        <p className="text-sm text-gray-600">{data.hp}</p>
        <p className="text-sm text-gray-600 mb-4">{data.alamat}</p>

        <div className="border-t pt-3 mt-3">
          <p className="font-semibold">Pesanan:</p>
          <p className="text-sm">{data.produk}</p>
        </div>

        <div className="flex justify-between border-t pt-4 mt-4">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-lg text-[#0B4B50]">
            Rp{data.total.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Status: <span className="font-bold text-yellow-600">{data.status}</span>
        </div>
      </div>
    </main>
  )
}
