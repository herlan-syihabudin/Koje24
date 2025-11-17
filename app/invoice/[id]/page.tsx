import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

const HARGA_ONGKIR = 15000
const KONTAK_CS = "6281234567890"

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
    qty: Number(row[6]) || 0,
    subtotal: Number(row[7]) || 0,
    status: row[8] ?? "Pending",
    paymentMethod: "Transfer Bank Mandiri",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-300"
    case "paid":
    case "lunas":
      return "bg-emerald-50 text-emerald-700 border border-emerald-300"
    default:
      return "bg-gray-50 text-gray-700 border border-gray-300"
  }
}

export default async function InvoicePage(props: any) {
  const { id } = await props.params
  const idClean = id?.trim?.() ?? ""

  if (!idClean) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-lg text-red-500">Invoice ID tidak valid 🚫</h2>
      </main>
    )
  }

  const data = await getOrder(idClean)
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-lg text-red-500">Invoice tidak ditemukan 🚫</h2>
      </main>
    )
  }

  const pricePerItem =
    data.qty > 0 ? Math.round(data.subtotal / data.qty) : data.subtotal

  const grandTotal = data.subtotal + HARGA_ONGKIR
  const statusClasses = getStatusColor(data.status)

  return (
    <main className="min-h-screen bg-[#F4FAFA] flex justify-center py-6 px-3 print:bg-white print:p-0">

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl 
        border border-slate-200 overflow-hidden
        print:shadow-none print:rounded-none print:border-none">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-slate-200 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[0.15em] text-slate-900">
              INVOICE
            </h1>
            <p className="mt-2 font-semibold text-sm">KOJE24 Official</p>
            <p className="text-xs text-slate-500 leading-tight">
              Jl. Jenderal Sudirman No. 24, Jakarta Selatan<br />
              Tel: {KONTAK_CS} • order@koje24.com
            </p>
          </div>

          <img src="/logo-koje24.png" alt="KOJE24" className="h-12 w-auto" />
        </div>

        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-2 p-6 gap-4 text-[13px]">
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">
              Dikirim Kepada:
            </p>
            <p className="font-semibold">{data.nama}</p>
            <p>{data.hp}</p>
            <p className="max-w-[90%]">{data.alamat}</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">
              Invoice:
            </p>
            <p className="text-lg font-extrabold tracking-wide text-[#0B4B50]">
              {data.invoiceId}
            </p>
            <p
              className={`inline-block mt-2 px-2 py-1 rounded-md 
              text-[10px] font-bold ${statusClasses}`}
            >
              {data.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="px-6">
          <table className="w-full border border-slate-300 text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[11px]">
              <tr>
                <th className="p-2 text-left w-[50%]">Produk</th>
                <th className="p-2 text-right w-[15%]">Harga</th>
                <th className="p-2 text-right w-[10%]">Qty</th>
                <th className="p-2 text-right w-[25%]">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 font-medium">{data.produk}</td>
                <td className="p-3 text-right">
                  Rp{pricePerItem.toLocaleString("id-ID")}
                </td>
                <td className="p-3 text-right">{data.qty}x</td>
                <td className="p-3 text-right font-bold text-[#0B4B50]">
                  Rp{data.subtotal.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="p-6 flex justify-end text-sm">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">
                Rp{data.subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span className="font-semibold">
                Rp{HARGA_ONGKIR.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#0B4B50]">
              <span>Total</span>
              <span>
                Rp{grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="p-6 border-t flex justify-between text-sm">
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-2">
              Pembayaran:
            </p>
            <p className="font-semibold">{data.paymentMethod}</p>
            <p>No.Rek: <strong className="text-red-600">{data.bankAccount}</strong></p>
            <p>a/n {data.accountName}</p>

            <a
              href={`https://wa.me/${KONTAK_CS}?text=Saya%20sudah%20bayar%20Invoice%20${data.invoiceId}`}
              target="_blank"
              className="mt-3 inline-block bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition print:hidden"
            >
              Konfirmasi Pembayaran
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-4 text-center text-[11px] border-t">
          TERIMA KASIH TELAH MEMERCAYAI KOJE24 🙏<br />
          <span className="text-slate-400 text-[10px]">
            Invoice ini adalah bukti pembelian yang sah
          </span>
        </div>

      </div>
    </main>
  )
}
