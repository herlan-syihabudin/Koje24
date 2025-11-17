import { google } from "googleapis"
import Image from "next/image"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

async function getOrder(invoiceId: string) {
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
  const row = rows.find((r) => String(r?.[1] || "").trim() === invoiceId.trim())

  if (!row) return null

  return {
    date: row[0],
    invoiceId: row[1],
    nama: row[2],
    hp: row[3],
    alamat: row[4],
    produk: row[5],
    qty: Number(row[6]),
    total: Number(row[7]),
    status: row[8],
  }
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string }
}) {
  const data = await getOrder(params.id)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan 🚫
        </h2>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F9FA] flex justify-center p-4 md:p-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 w-full max-w-2xl">

        {/* BRANDING */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0B4B50]">KOJE<span className="text-[#FBBF24]">24</span></h1>
          <p className="text-gray-400 text-sm">Natural Cold-Pressed Juice</p>
        </div>

        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Invoice #{data.invoiceId}
          </h2>
          <p className="text-sm text-gray-500">Tanggal: {data.date}</p>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-6 space-y-1">
          <p className="font-semibold text-gray-700">Penerima:</p>
          <p className="text-gray-800">{data.nama}</p>
          <p className="text-gray-500">{data.hp}</p>
          <p className="text-gray-500">{data.alamat}</p>
        </div>

        {/* PRODUCT */}
        <div className="border-t border-b py-4 my-6">
          <div className="flex justify-between text-gray-700 mb-1">
            <span className="font-semibold">{data.produk}</span>
            <span>x{data.qty}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[#0B4B50]">
            <span>Total</span>
            <span>Rp{data.total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status Pembayaran:</span>
          <span
            className={`font-bold px-3 py-1 rounded-lg ${
              data.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {data.status}
          </span>
        </div>
      </div>
    </main>
  )
}
