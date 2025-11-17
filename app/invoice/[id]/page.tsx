import { google } from "googleapis"

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
    range: "Sheet1!A2:M999",
  })

  const rows = res.data.values || []
  const row = rows.find((r) => String(r?.[1] || "").trim() === idClean)

  if (!row) return null

  const subtotal = Number(row[7] ?? 0)
  const ongkir = Number(row[12] ?? 15000)
  const totalFinal = subtotal + ongkir

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: Number(row[6] ?? 0),
    subtotal,
    ongkir,
    totalFinal,
    status: row[8] ?? "Pending",
  }
}

export default async function InvoicePage({ params }: any) {
  const { id } = params
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

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="font-bold text-xl text-black">KOJE24</h1>
            <p className="text-xs text-gray-600">
              Natural Cold-Pressed Juice
            </p>
            <p className="text-xs text-gray-500">
              Grandwisata, Bekasi • Whatsapp: 08xxxxxx
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold text-black tracking-wider">
              INVOICE
            </h2>
            <p className="text-xs text-gray-500">
              Invoice #: {data.invoiceId}
            </p>
            <p className="text-xs text-gray-500">{data.timestamp}</p>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-1 text-gray-800">
            Ditagihkan Kepada:
          </h3>
          <p className="text-sm text-gray-700">{data.nama}</p>
          <p className="text-sm text-gray-700">{data.hp}</p>
          <p className="text-sm text-gray-700 max-w-sm">{data.alamat}</p>
        </div>

        {/* TABEL PESANAN */}
        <table className="w-full text-sm border-t border-b border-gray-300 mb-6">
          <thead>
            <tr className="text-left">
              <th className="py-2">Produk</th>
              <th>Qty</th>
              <th className="text-right">Harga</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2">{data.produk}</td>
              <td className="text-center">{data.qty}</td>
              <td className="text-right">
                Rp{(data.subtotal / data.qty).toLocaleString("id-ID")}
              </td>
              <td className="text-right">
                Rp{data.subtotal.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* RINGKASAN BIAYA */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              Rp{data.subtotal.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Ongkir (Flat)</span>
            <span>
              Rp{data.ongkir.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t mt-2 font-bold text-base">
            <span>Total Pembayaran</span>
            <span className="text-black">
              Rp{data.totalFinal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* STATUS + PEMBAYARAN */}
        <div className="mt-6 text-sm">
          <p>Status: <span className="font-semibold text-yellow-700">{data.status}</span></p>
        </div>
        <div className="mt-2 text-sm">
          <p className="font-semibold text-gray-800 mb-1">Metode Pembayaran:</p>
          <p>Transfer Bank Mandiri</p>
          <p>No. Rek: <strong>9918282983939</strong></p>
          <p>Atas Nama: <strong>KOJE24</strong></p>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Terima kasih telah memesan produk sehat kami 🍃
        </p>
      </div>
    </main>
  )
}
