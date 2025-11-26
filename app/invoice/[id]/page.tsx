import { google } from "googleapis"

export const viewport = {
  themeColor: "#0FA3A8",
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

const KONTAK_CS = "6282213139580"

// helper
function normalize(v: any) {
  return String(v || "").trim()
}

/* ============================================================
   FETCH DATA INVOICE DARI GOOGLE SHEET
============================================================ */
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
    range: "Sheet1!A2:M999",
  })

  const rows = res.data.values || []

  // cari berdasarkan kolom B (invoiceId) atau kolom M (invoiceUrl)
  const row =
    rows.find((r) => String(r[1]).trim() === clean) ||
    rows.find((r) => String(r[12] || "").trim().includes(clean))

  if (!row) return null

  const subtotal = Number(row[7]) || 0
  const ongkir = Number(row[10]) || 0
  const grandTotal = Number(row[11]) || subtotal + ongkir

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: Number(row[6]) || 0,
    subtotal,
    status: row[8] ?? "Pending",
    paymentMethod: row[9] || "Transfer Bank Mandiri",
    ongkir,
    grandTotal,
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}

/* ============================================================
   STATUS BADGE COLOR
============================================================ */
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-300"
    case "paid":
    case "lunas":
      return "bg-emerald-50 text-emerald-700 border border-emerald-300"
    case "cod":
      return "bg-blue-50 text-blue-700 border border-blue-300"
    default:
      return "bg-gray-50 text-gray-700 border border-gray-300"
  }
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default async function InvoicePage({ params }: any) {
  const id = params?.id || ""
  const clean = normalize(id)

  // 🟢 FIX paling penting — hilangkan karakter dari Telegram / URL encoded
  const safeId = clean.replace(/(%0A|[\n\r\t\s]|\?.*)/g, "")

  const data = await getOrder(safeId)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan 🚫
        </h2>
      </main>
    )
  }

  const safeSubtotal = data.subtotal || 0
  const safeOngkir = data.ongkir || 0
  const safeGrandTotal = data.grandTotal || safeSubtotal + safeOngkir

  const pricePerItem =
    data.qty > 0 ? Math.round(safeSubtotal / data.qty) : safeSubtotal

  const statusClasses = getStatusColor(data.status)

  return (
    <main className="min-h-screen bg-[#F4FAFA] flex justify-center py-6 px-3 print:bg-white">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden print:shadow-none print:rounded-none print:border-none">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-slate-200 px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold tracking-[0.15em] text-slate-900">
              INVOICE
            </h1>
            <p className="mt-2 font-semibold text-sm">KOJE24 Official</p>
            <p className="text-xs text-slate-500 leading-tight">
              Jl. Jenderal Sudirman No. 24, Jakarta Selatan
              <br />
              Tel: {KONTAK_CS} • order@koje24.com
            </p>
          </div>
          <img src="/logo-koje24.png" alt="KOJE24" className="h-12 w-auto" />
        </div>

        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-3 px-6 py-4 gap-4 text-[13px] border-b border-slate-100">
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">
              Dikirim Kepada:
            </p>
            <p className="font-semibold text-slate-900">{data.nama}</p>
            <p className="text-slate-600">{data.hp}</p>
            <p className="text-slate-600 leading-snug max-w-[90%]">
              {data.alamat}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">
              Tanggal Pesanan:
            </p>
            <p className="text-slate-700">{data.timestamp}</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">
              No. Invoice:
            </p>
            <p className="text-lg font-extrabold tracking-wide text-[#0B4B50]">
              {data.invoiceId}
            </p>
            <p
              className={`inline-block mt-2 px-2 py-1 rounded-md text-[10px] font-bold ${statusClasses}`}
            >
              {data.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="px-6 py-4">
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
                <td className="p-3 font-medium text-slate-800">
                  {data.produk}
                </td>
                <td className="p-3 text-right">
                  Rp{pricePerItem.toLocaleString("id-ID")}
                </td>
                <td className="p-3 text-right text-slate-800">
                  {data.qty}x
                </td>
                <td className="p-3 text-right font-bold text-[#0B4B50]">
                  Rp{safeSubtotal.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="px-6 py-4 flex justify-end text-sm border-b">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">
                Rp{safeSubtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span className="font-semibold">
                Rp{safeOngkir.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#0B4B50]">
              <span>TOTAL AKHIR</span>
              <span>Rp{safeGrandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="px-6 py-4 flex justify-between text-sm items-start">
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-2">
              Rincian Pembayaran:
            </p>

            <p className="font-semibold">{data.paymentMethod}</p>
            <p>
              No.Rek: <strong className="text-red-600">{data.bankAccount}</strong>
            </p>
            <p>
              a/n <strong className="text-slate-800">{data.accountName}</strong>
            </p>

            <a
              href={`https://wa.me/${KONTAK_CS}?text=Saya%20sudah%20bayar%20Invoice%20${data.invoiceId}`}
              target="_blank"
              className="mt-4 inline-block bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
            >
              ✅ Konfirmasi Pembayaran
            </a>
          </div>

          <div className="text-right mt-4">
            <p className="font-semibold text-slate-800">Hormat Kami,</p>
            <p className="font-bold text-[#0B4B50] mt-8">Admin KOJE24</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-3 text-center text-[11px] border-t bg-slate-50">
          <strong className="text-slate-700">
            TERIMA KASIH TELAH MEMERCAYAI KOJE24 🙏
          </strong>
          <br />
          <span className="text-slate-400 text-[10px]">
            Invoice ini adalah bukti pembelian yang sah
          </span>
        </div>
      </div>
    </main>
  )
}
