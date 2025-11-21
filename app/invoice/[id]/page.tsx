import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

const HARGA_ONGKIR = 15000
const KONTAK_CS = "6282213139580"

const normalize = (v: any) => String(v || "").trim().toLowerCase()

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
    range: "Sheet1!A2:L999",
  })

  const rows = res.data.values || []

  const row =
    rows.find((r) => normalize(r[1]) === clean) ||
    rows.find((r) => normalize(r[11]).includes(clean))

  if (!row) return null

  return (
  <main className="min-h-screen bg-[#F4FAFA] flex justify-center py-6 px-3 print:bg-white print:p-0 print:m-0 print:min-h-0">

    <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl
      border border-slate-200 overflow-hidden
      print:shadow-none print:rounded-none print:border-none print:w-full print:max-w-full">

      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-slate-200 px-6 py-4 print:py-3">
        <div>
          <h1 className="text-3xl font-bold tracking-[0.15em] text-slate-900 print:text-2xl">
            INVOICE
          </h1>
          <p className="mt-2 font-semibold text-sm">KOJE24 Official</p>
          <p className="text-xs text-slate-500 leading-tight print:text-[10px]">
            Jl. Jenderal Sudirman No. 24, Jakarta Selatan<br />
            Tel: {KONTAK_CS} • order@koje24.com
          </p>
        </div>

        <img src="/logo-koje24.png" alt="KOJE24" className="h-12 w-auto print:h-10" />
      </div>

      {/* CUSTOMER INFO */}
      <div className="grid grid-cols-3 px-6 py-4 gap-4 text-[13px] border-b border-slate-100 print:text-[11px] print:py-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-700 mb-1">
            Dikirim Kepada:
          </p>
          <p className="font-semibold text-slate-900">{data.nama}</p>
          <p className="text-slate-600">{data.hp}</p>
          <p className="text-slate-600 leading-snug max-w-[90%]">{data.alamat}</p>
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
          <p className="text-lg font-extrabold tracking-wide text-[#0B4B50] print:text-base">
            {data.invoiceId}
          </p>

          <p className={`inline-block mt-2 px-2 py-1 rounded-md 
            text-[10px] font-bold ${statusClasses}`}>
            {data.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-6 py-4">
        <table className="w-full border border-slate-300 text-sm print:text-[11px]">
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
              <td className="p-3 font-medium text-slate-800">{data.produk}</td>
              <td className="p-3 text-right">Rp{pricePerItem.toLocaleString("id-ID")}</td>
              <td className="p-3 text-right text-slate-800">{data.qty}x</td>
              <td className="p-3 text-right font-bold text-[#0B4B50]">
                Rp{safeSubtotal.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="px-6 py-4 flex justify-end text-sm border-b print:py-3">
        <div className="w-full max-w-xs space-y-2 print:max-w-full">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">
              Rp{safeSubtotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span className="font-semibold text-slate-800">
              Rp{HARGA_ONGKIR.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#0B4B50] print:text-base print:pt-2">
            <span>TOTAL AKHIR</span>
            <span>Rp{grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="px-6 py-4 flex justify-between text-sm items-start print:py-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-700 mb-2">
            Rincian Pembayaran:
          </p>

          <p className="font-semibold">{data.paymentMethod}</p>
          <p>No.Rek: <strong className="text-red-600">{data.bankAccount}</strong></p>
          <p>a/n <strong className='text-slate-800'>{data.accountName}</strong></p>

          <a
            href={`https://wa.me/${KONTAK_CS}?text=Saya%20sudah%20bayar%20Invoice%20${data.invoiceId}`}
            target="_blank"
            className="mt-4 inline-block bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition print:hidden"
          >
            ✅ Konfirmasi Pembayaran
          </a>
        </div>

        <div className="text-right mt-4 print:mt-1">
          <p className="font-semibold text-slate-800">Hormat Kami,</p>
          <p className="font-bold text-[#0B4B50] mt-8 print:mt-4">Admin KOJE24</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-3 text-center text-[11px] border-t bg-slate-50 print:bg-white print:py-2">
        <strong className='text-slate-700'>TERIMA KASIH TELAH MEMERCAYAI KOJE24 🙏</strong><br />
        <span className="text-slate-400 text-[10px]">
          Invoice ini adalah bukti pembelian yang sah
        </span>
      </div>

    </div>
  </main>
)
}
