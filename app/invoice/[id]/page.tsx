import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
const ONGKIR = 15000 // Flat Ongkir

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
    range: "'INVOICE KOJE24'!A2:L999",
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
    subtotal: Number(row[7] ?? 0),
    status: row[8] ?? "Pending",
  }
}

export default async function InvoicePage({ params }: any) {
  const idClean = params?.id?.trim?.() ?? ""

  if (!idClean)
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice ID tidak valid 🚫
        </h2>
      </main>
    )

  const data = await getOrder(idClean)

  if (!data)
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan 🚫
        </h2>
      </main>
    )

  const price = data.qty > 0 ? Math.round(data.subtotal / data.qty) : data.subtotal
  const grandTotal = data.subtotal + ONGKIR

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 px-10 py-10">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-300 pb-6 mb-8">
          <div className="text-left">
            <p className="text-3xl font-extrabold tracking-[0.20em] text-slate-900">
              INVOICE
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              Natural Cold-Pressed Juice
            </p>
          </div>

          {/* Logo KOJE24 */}
          <div className="text-right">
            <p className="text-3xl font-black tracking-wide text-[#0B4B50]">
              KOJE<span className="text-amber-400">24</span>
            </p>
          </div>
        </div>

        {/* INFORMASI KLIEN */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="font-bold text-slate-700 mb-1">Kepada:</p>
            <p className="font-semibold text-slate-900">{data.nama}</p>
            <p className="text-slate-600">{data.hp}</p>
            <p className="text-slate-600 text-xs break-words leading-snug">{data.alamat}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700">Tanggal:</p>
            <p className="text-slate-700">{data.timestamp}</p>
            <p className="font-bold text-slate-700 mt-2">No. Invoice:</p>
            <p className="font-semibold text-slate-900">{data.invoiceId}</p>
          </div>
        </div>

        {/* ITEM TABLE */}
        <div className="rounded-lg overflow-hidden border border-slate-300">
          <div className="grid grid-cols-4 text-xs font-bold uppercase bg-slate-100 text-slate-700 py-2 px-3 border-b border-slate-300">
            <span className="col-span-2">Produk</span>
            <span className="text-right">Harga</span>
            <span className="text-right">Qty / Total</span>
          </div>

          {/* Row */}
          <div className="grid grid-cols-4 text-sm text-slate-800 py-3 px-3 border-b border-slate-200">
            <span className="col-span-2">{data.produk}</span>
            <span className="text-right">
              Rp{price.toLocaleString("id-ID")}
            </span>
            <span className="text-right">
              x{data.qty} = Rp{data.subtotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* RINGKASAN TOTAL */}
        <div className="flex flex-col items-end mt-8 text-sm w-full">
          <div className="flex justify-between w-64">
            <span className="text-slate-600 font-medium">Subtotal</span>
            <span className="font-semibold">
              Rp{data.subtotal.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex justify-between w-64">
            <span className="text-slate-600 font-medium">Ongkir</span>
            <span className="font-semibold">
              Rp{ONGKIR.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="border-t border-slate-400 my-2 w-64" />

          <div className="flex justify-between w-64 text-lg font-bold">
            <span className="text-slate-900">Grand Total</span>
            <span className="text-slate-900">
              Rp{grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* STATUS & PEMBAYARAN */}
        <div className="mt-10 flex justify-between items-start text-xs md:text-sm">
          <div>
            <p className="font-bold text-slate-700">Pembayaran:</p>
            <p className="text-slate-700">Transfer Bank Mandiri</p>
            <p className="text-slate-700">
              No. Rek: <strong>9918282983939</strong>
            </p>
            <p className="text-slate-700">
              A/N: <strong>KOJE24</strong>
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-700">Status:</p>
            <p
              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mt-1
              ${
                (data.status || "").toLowerCase() === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {(data.status || "").toUpperCase()}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold text-slate-700">
            TERIMA KASIH ATAS PEMBELIAN ANDA 💚
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            KOJE24 • Natural Cold-Pressed Juice • No Sugar • No Preservatives
          </p>
        </div>
      </div>
    </main>
  )
}
