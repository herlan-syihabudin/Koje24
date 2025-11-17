import { google } from "googleapis"

// ENV dari Vercel
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

async function getOrder(invoiceId: string) {
  console.log("🔍 Invoice ID dari URL:", invoiceId)

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
    range: "Sheet1!A2:L999",
  })

  const rows = res.data.values || []

  const row =
    rows.find((r) => String(r?.[1] || "").trim() === idClean) ||
    rows.find((r) => String(r?.[11] || "").trim().includes(idClean))

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
    status: row[8] ?? "Unknown",
    paymentMethod: row[9] ?? "",
    bankInfo: row[10] ?? "",
    linkInvoice: row[11] ?? "",
  }
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string }
}) {
  const id = params?.id?.trim?.() ?? ""

  if (!id) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice ID tidak valid 🚫
        </h2>
      </main>
    )
  }

  const data = await getOrder(id)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan 🚫
        </h2>
      </main>
    )
  }

  const totalFormatted = (num: number) =>
    `Rp${num.toLocaleString("id-ID")}`

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-gray-200">
        
        {/* Header Invoice */}
        <div className="flex justify-between items-start mb-6">
          <div className="font-bold text-[#0B4B50] text-2xl">
            KOJE24
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#0B4B50]">
              INVOICE
            </p>
            <p className="text-gray-500 text-sm">{data.timestamp}</p>
            <p className="text-sm font-medium">#{data.invoiceId}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <p className="font-semibold">Dibuat untuk:</p>
          <p className="text-gray-700">{data.nama}</p>
          <p className="text-gray-700">{data.hp}</p>
          <p className="text-gray-700 whitespace-pre-line">
            {data.alamat}
          </p>
        </div>

        {/* Table Item */}
        <table className="w-full border-t border-b py-3 mb-3 text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Produk</th>
              <th className="text-center p-2 w-14">Qty</th>
              <th className="text-right p-2">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-2">{data.produk}</td>
              <td className="text-center p-2">{data.qty}</td>
              <td className="text-right p-2">{totalFormatted(data.total)}</td>
            </tr>
          </tbody>
        </table>

        {/* Payment Summary */}
        <div className="flex justify-between text-lg font-semibold mt-2 mb-4">
          <span>Total yang harus dibayar</span>
          <span className="text-[#0B4B50]">
            {totalFormatted(data.total)}
          </span>
        </div>

        {/* Status Pembayaran */}
        <div className="text-sm mb-6">
          Status Pembayaran:{" "}
          <span className="font-bold text-yellow-600">{data.status}</span>
        </div>

        {/* Bank Information */}
        <div className="bg-gray-50 border rounded-xl p-4 text-sm">
          <p className="font-semibold mb-1">Pembayaran Via:</p>
          <p>Bank Mandiri</p>
          <p>No. Rekening: 9918282983939</p>
          <p>Atas Nama: KOJE24</p>
        </div>
      </div>
    </main>
  )
}
