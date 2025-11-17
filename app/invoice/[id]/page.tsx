import { google } from "googleapis"

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
    status: row[8] ?? "Pending",
    paymentMethod: "Bank Transfer",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
    qrisImage: "/qris-koje24.png", // Upload di public folder
    adminWA: "6281234567890", // Ubah sesuai nomor WhatsApp admin
  }
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase()
  if (s === "paid" || s === "lunas") return "bg-emerald-100 text-emerald-700"
  if (s === "pending") return "bg-amber-100 text-amber-700"
  return "bg-gray-200 text-gray-600"
}

export default async function InvoicePage({ params }: any) {
  const id = params.id
  const data = await getOrder(id)

  if (!data) {
    return (
      <main className="p-10 text-center font-bold text-red-600">
        ⚠️ INVOICE TIDAK DITEMUKAN
      </main>
    )
  }

  const pricePerItem =
    data.qty > 0 ? Math.round(data.total / data.qty) : data.total

  const urlWA = `https://wa.me/${data.adminWA}?text=Halo%20Admin,%20Saya%20sudah%20bayar%20Invoice%20${data.invoiceId}`

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white">
      {/* Watermark */}
      <img
        src="/logo-koje24.png"
        className="fixed opacity-[0.03] -z-10 w-[600px] top-[20%] left-[15%] hidden print:block"
      />

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl border-t-8 border-[#0B4B50] p-10 print:shadow-none print:border-0">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">INVOICE</h1>
            <p className="text-xs text-slate-500 mt-2">
              KOJE24 Official • Natural Cold-Pressed Juice
              <br />
              Jl. Jenderal Sudirman No. 24, Jakarta
            </p>
          </div>
          <img src="/logo-koje24.png" className="w-28" />
        </div>

        {/* Customer Info */}
        <div className="bg-slate-50 border px-6 py-5 rounded-lg mb-8">
          <h3 className="text-sm font-extrabold uppercase text-slate-700 mb-4">
            Detail Pemesanan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm">

            <div className="space-y-1">
              <p className="font-bold">Kepada</p>
              <p className="font-semibold">{data.nama}</p>
              <a
                href={`tel:${data.hp}`}
                className="text-[#0B4B50] underline font-semibold"
              >
                {data.hp}
              </a>
              <p className="text-slate-600 break-words">{data.alamat}</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold">Tanggal Pesanan</p>
              <p>{data.timestamp}</p>
            </div>

            <div className="text-right">
              <p className="font-bold">No. Invoice</p>
              <p className="text-xl font-extrabold text-[#0B4B50] tracking-wider">
                {data.invoiceId}
              </p>
              <span
                className={`${getStatusColor(
                  data.status
                )} mt-2 px-3 py-1 inline-flex rounded-full text-xs font-bold`}
              >
                {data.status.toUpperCase()}
              </span>
            </div>

          </div>
        </div>

        {/* Products */}
        <table className="w-full text-sm mb-10">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-xs">
              <th className="text-left py-2 px-2">Produk</th>
              <th className="text-right px-2">Harga</th>
              <th className="text-right px-2">Qty</th>
              <th className="text-right px-2 pr-4">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 px-2 font-semibold">{data.produk}</td>
              <td className="px-2 text-right">
                Rp{pricePerItem.toLocaleString("id-ID")}
              </td>
              <td className="px-2 text-right">x{data.qty}</td>
              <td className="px-2 text-right pr-4 font-extrabold text-[#0B4B50]">
                Rp{data.total.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold uppercase mb-2 text-sm">Pembayaran</h3>
            <p className="font-semibold">{data.paymentMethod}</p>
            <button
              className="mt-1 text-red-600 font-bold underline text-sm"
              onClick={() =>
                navigator.clipboard.writeText(data.bankAccount)
              }
            >
              {data.bankAccount} (SALIN)
            </button>
            <p className="text-xs mt-1 text-slate-600">
              a.n {data.accountName}
            </p>

            {/* QRIS */}
            <img src={data.qrisImage} className="mt-4 w-36 rounded-lg" />
            <p className="text-[10px] text-slate-500 mt-1">
              Scan untuk bayar via QRIS
            </p>
          </div>

          {/* Grand Total */}
          <div className="text-right">
            <div className="inline-block bg-slate-100 px-6 py-4 rounded-lg border-2 border-slate-300">
              <p className="text-xs uppercase text-slate-600 font-bold">
                Grand Total
              </p>
              <p className="text-3xl font-extrabold text-[#0B4B50]">
                Rp{data.total.toLocaleString("id-ID")}
              </p>
            </div>

            <a
              href={urlWA}
              target="_blank"
              className="mt-4 inline-block bg-[#0B4B50] text-white py-2 px-4 rounded-lg font-bold text-xs"
            >
              📩 Konfirmasi Pembayaran
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-12 border-t pt-4">
          Terima Kasih Telah Mempercayai KOJE24 🙏
        </p>
      </div>
    </main>
  )
}
