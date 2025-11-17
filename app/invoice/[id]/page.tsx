import { google } from "googleapis"
import Image from "next/image"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

async function getOrder(invoiceId: string) {
  const idClean = invoiceId?.trim?.() ?? ""
  if (!idClean) return null

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A2:N999",
  })

  const rows = res.data.values || []
  const row =
    rows.find((r) => String(r?.[1] || "").trim() === idClean) ||
    rows.find((r) => String(r?.[13] || "").trim().includes(idClean))

  if (!row) return null

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: Number(row[6] ?? 1),
    total: Number(row[7] ?? 0),
    ongkir: Number(row[12] ?? 15000),
    status: row[8] ?? "Pending",
  }
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const id = params.id
  const data = await getOrder(id)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg font-semibold">Invoice tidak ditemukan 🚫</p>
      </main>
    )
  }

  const subTotal = data.total
  const ongkir = data.ongkir
  const grandTotal = subTotal + ongkir

  return (
    <main className="min-h-screen bg-gray-100 pt-10 pb-24 px-4 flex justify-center">
      <div className="bg-white shadow-2xl rounded-xl w-full max-w-2xl p-10 border border-gray-200">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#0B4B50] flex items-center justify-center rounded-lg">
              <span className="text-white text-xl font-bold">KOJE24</span>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900">INVOICE</h1>
            <p className="text-sm text-gray-500 font-medium">
              #{data.invoiceId}
            </p>
          </div>
        </div>

        {/* INFO CUSTOMER */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700">{data.nama}</p>
          <p className="text-sm text-gray-600">{data.hp}</p>
          <p className="text-sm text-gray-600">{data.alamat}</p>
          <p className="text-xs text-gray-500 mt-1">{data.timestamp}</p>
        </div>

        {/* TABLE ORDER */}
        <table className="w-full text-sm mb-6 border-t border-gray-300">
          <thead>
            <tr className="text-gray-700 bg-gray-100">
              <th className="px-3 py-2 text-left font-semibold">Produk</th>
              <th className="px-3 py-2 text-center font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-3 py-3">{data.produk}</td>
              <td className="px-3 py-3 text-center">{data.qty}</td>
              <td className="px-3 py-3 text-right">
                Rp{data.total.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="text-sm mt-4">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              Rp{subTotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Ongkir</span>
            <span className="font-medium">
              Rp{ongkir.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-3 mt-2">
            <span className="font-semibold text-gray-900">TOTAL</span>
            <span className="font-extrabold text-lg text-[#0B4B50]">
              Rp{grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* STATUS */}
        <p className="text-sm mt-4">
          Status Pembayaran:{" "}
          <span className="font-bold text-yellow-600">{data.status}</span>
        </p>

        {/* PAYMENT INFO */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-dashed border-[#0B4B50]">
          <p className="text-xs text-gray-700 font-semibold mb-1">Transfer ke:</p>
          <p className="text-sm font-bold text-[#0B4B50]">Bank Mandiri</p>
          <p className="text-sm">9918282983939</p>
          <p className="text-sm">a.n KOJE24</p>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-gray-400 text-center mt-10">
          Terima kasih sudah berbelanja di KOJE24!
        </p>
      </div>
    </main>
  )
}
