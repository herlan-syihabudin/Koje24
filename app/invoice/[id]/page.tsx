import { google } from "googleapis"

// --- KONFIGURASI ENV ---
// Pastikan 3 variabel ini sudah diset di Vercel
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

// Konstanta Hardcode (jika tidak ditarik dari Sheet)
const HARGA_ONGKIR = 15000 
const KONTAK_CS = "6281234567890" // Ganti dengan nomor WA CS kamu (tanpa +)

// --- FUNGSI GET DATA DARI GOOGLE SHEETS ---
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
    range: "Sheet1!A2:L999", // GANTI NAMA SHEET JIKA BUKAN 'Sheet1'!
  })

  const rows = res.data.values || []

  const row =
    rows.find((r) => String(r?.[1] || "").trim() === idClean) ||
    rows.find((r) => String(r?.[11] || "").trim().includes(idClean))

  if (!row) return null
  
  // FIX: Konversi data numerik dengan aman untuk mencegah crash
  const qty = Number(row[6]) || 0
  const total = Number(row[7]) || 0

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: qty, 
    subtotal: total, // Menggunakan 'total' dari sheet sebagai 'subtotal'
    status: row[8] ?? "Pending",
    // Data Pembayaran Hardcode
    paymentMethod: "Transfer Bank Mandiri",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}

// Helper function untuk Badge Status
const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-amber-50 text-amber-700 border border-amber-300';
        case 'paid':
        case 'lunas':
            return 'bg-emerald-50 text-emerald-700 border border-emerald-300';
        default:
            return 'bg-gray-50 text-gray-700 border border-gray-300';
    }
}

export default async function InvoicePage(props: any) {
  const { id } = await props.params
  const idClean = id?.trim?.() ?? ""
  
  // 1. Handle ID Tidak Valid
  if (!idClean) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice ID tidak valid 🚫
        </h2>
      </main>
    )
  }
  
  const data = await getOrder(idClean)

  // 2. Handle Invoice Tidak Ditemukan
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan di database 🚫
        </h2>
      </main>
    )
  }

  const pricePerItem = data.qty && data.qty > 0 ? Math.round(data.subtotal / data.qty) : data.subtotal
  const grandTotal = data.subtotal + HARGA_ONGKIR
  const statusClasses = getStatusColor(data.status);

return (
  <main className="min-h-screen bg-[#F4FAFA] py-12 px-4 flex justify-center print:p-0">
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl 
                    border border-slate-200 overflow-hidden
                    print:rounded-none print:shadow-none print:border-none">

      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-slate-200 px-10 py-8">
        <div>
          <h1 className="text-4xl font-bold tracking-[0.20em] text-slate-900">
            INVOICE
          </h1>
          <div className="mt-3 text-xs text-slate-500 leading-tight">
            <p className="font-semibold text-slate-700">KOJE24 Official</p>
            <p>Jl. Jenderal Sudirman No. 24, Jakarta Selatan</p>
            <p>Tel: {KONTAK_CS} | Email: order@koje24.com</p>
          </div>
        </div>

        <div className="text-right">
          <img 
            src="/logo-koje24.png"
            alt="KOJE24"
            className="h-16 w-auto mx-auto"
          />
          <p className="text-[11px] text-slate-500 mt-2">
            Natural Cold-Pressed Juice
          </p>
        </div>
      </div>

      {/* INFO PELANGGAN */}
      <div className="px-10 py-8 grid grid-cols-2 gap-6">
        
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-700 mb-1">
            Dikirim Kepada:
          </p>
          <p className="font-bold text-slate-900">{data.nama}</p>
          <p className="text-slate-600 text-sm">{data.hp}</p>
          <p className="text-slate-600 text-sm max-w-[95%]">{data.alamat}</p>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold uppercase text-slate-700 mb-1">
            Tanggal Pesanan:
          </p>
          <p className="text-sm text-slate-800">{data.timestamp}</p>

          <p className="text-[11px] font-bold uppercase text-slate-700 mt-4">
            No. Invoice:
          </p>
          <p className="text-xl font-extrabold tracking-wide text-[#0B4B50]">
            {data.invoiceId}
          </p>

          <p className={`inline-flex mt-2 px-3 py-1 rounded-full 
                         text-[10px] font-bold tracking-wide ${statusClasses}`}>
            {(data.status || "").toUpperCase()}
          </p>
        </div>
      </div>

      {/* TABEL PRODUK */}
      <div className="px-10">
        <table className="w-full text-xs md:text-sm border border-slate-300 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-600 uppercase font-bold">
            <tr>
              <th className="py-3 px-3 text-left">Produk</th>
              <th className="py-3 px-3 text-right whitespace-nowrap">Harga</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-900">
                {data.produk}
              </td>
              <td className="py-3 px-3 text-right text-slate-700">
                Rp{pricePerItem.toLocaleString("id-ID")}
              </td>
              <td className="py-3 px-3 text-right text-slate-700">
                {data.qty}x
              </td>
              <td className="py-3 px-3 text-right font-bold text-[#0B4B50]">
                Rp{data.subtotal.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RINGKASAN TOTAL */}
      <div className="px-10 mt-8 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-semibold">
              Rp{data.subtotal.toLocaleString("id-ID")}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">Ongkos Kirim</span>
            <span className="font-semibold">
              Rp{HARGA_ONGKIR.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="border-t border-slate-300 pt-3 flex justify-between text-lg font-extrabold">
            <span className="text-slate-900">GRAND TOTAL</span>
            <span className="text-[#0B4B50]">
              Rp{grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* PEMBAYARAN */}
      <div className="px-10 py-10 mt-6 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-700 mb-2">
            Pembayaran:
          </p>
          <p className="font-bold">{data.paymentMethod}</p>
          <p className="text-slate-700">No. Rek: <span className="text-red-600 font-bold">{data.bankAccount}</span></p>
          <p className="text-slate-700">a.n {data.accountName}</p>

          <a href={`https://wa.me/${KONTAK_CS}?text=Saya%20sudah%20bayar%20Invoice%20${data.invoiceId}`}
             target="_blank"
             className="mt-3 inline-block bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition">
            Konfirmasi Pembayaran
          </a>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold uppercase text-slate-700 mb-1">
            Catatan
          </p>
          <p className="italic text-slate-600">Harap bayar dalam 1x24 jam</p>

          <p className="mt-10 font-semibold text-slate-900">
            Hormat kami,
          </p>
          <p className="font-bold text-[#0B4B50]">
            Admin KOJE24
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 text-center text-[11px] text-slate-500 border-t border-slate-200">
        Terima kasih telah mempercayai KOJE24 🙏
      </div>

    </div>
  </main>
)

