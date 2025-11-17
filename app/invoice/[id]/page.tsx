import { google } from "googleapis"

// --- KONFIGURASI ENV ---
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
    subtotal: total, 
    status: row[8] ?? "Pending",
    paymentMethod: "Transfer Bank Mandiri", // GANTI DATA ASLI
    bankAccount: "9918282983939", // GANTI DATA ASLI
    accountName: "KOJE24", // GANTI DATA ASLI
  }
}

// Helper function untuk Badge Status
const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-amber-50 text-amber-700 border border-amber-300 print:bg-white print:text-amber-800 print:border print:border-amber-500';
        case 'paid':
        case 'lunas':
            return 'bg-emerald-50 text-emerald-700 border border-emerald-300 print:bg-white print:text-emerald-800 print:border print:border-emerald-500';
        default:
            return 'bg-gray-50 text-gray-700 border border-gray-300 print:bg-white print:text-gray-800 print:border print:border-gray-500';
    }
}

export default async function InvoicePage(props: any) {
  const { id } = await props.params
  const idClean = id?.trim?.() ?? ""
  
  if (!idClean) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">Invoice ID tidak valid 🚫</h2>
      </main>
    )
  }
  
  const data = await getOrder(idClean)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">Invoice tidak ditemukan di database 🚫</h2>
      </main>
    )
  }

  const pricePerItem = data.qty && data.qty > 0 ? Math.round(data.subtotal / data.qty) : data.subtotal
  const grandTotal = data.subtotal + HARGA_ONGKIR
  const statusClasses = getStatusColor(data.status);


  return (
    {/* Hapus min-h-screen saat print agar konten tidak terpotong, ganti dengan auto */}
    <main className="min-h-screen bg-slate-100 py-12 px-4 flex justify-center print:bg-white print:p-0 print:m-0 print:h-auto print:min-h-0">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border-t-8 border-[#0B4B50] px-10 py-10 
        print:shadow-none print:border-t-4 print:rounded-none print:w-full print:px-5 print:py-5 print:max-w-full">
        
        {/* === 1. HEADER PERUSAHAAN === */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-8 print:mb-4 print:pb-3">
          <div>
            <p className="text-4xl font-extrabold tracking-widest text-slate-900 print:text-3xl">
              INVOICE
            </p>
            <div className="text-xs text-slate-500 mt-2 space-y-0.5 print:text-[10px] print:mt-1">
                <p className="font-bold text-slate-700">KOJE24 Official</p>
                <p>Jl. Jenderal Sudirman No. 24, Jakarta Selatan</p>
                <p>Tel: {KONTAK_CS} | Email: order@koje24.com</p>
            </div>
          </div>

          {/* LOGO - PERIKSA PATH INI LAGI YA BRO! */}
          <div className="text-right">
                <img 
                    src="/logo-koje24.png" 
                    alt="Koje24 Company Logo" 
                    className="w-28 h-auto print:w-20" 
                /> 
            <p className="text-xs text-slate-500 mt-1 print:text-[9px]">
              Natural Cold-Pressed Juice
            </p>
          </div>
        </div>
        
        {/* === 2. INFORMASI KLIEN & INVOICE DETAIL === */}
        <div className="grid grid-cols-3 gap-4 text-xs md:text-sm mb-8 print:mb-4 print:text-[11px]">
            {/* KEPADA */}
          <div className='col-span-1'>
            <p className="font-bold text-slate-700 uppercase mb-1">Dikirim Kepada:</p>
            <p className="font-semibold text-slate-900">{data.nama}</p>
            <p className="text-slate-600">{data.hp}</p>
            <p className="text-slate-600 leading-snug">{data.alamat}</p>
          </div>
            
            {/* TANGGAL */}
            <div className="col-span-1">
                <p className="font-bold text-slate-700 uppercase mb-1">Tanggal Pesanan:</p>
                <p className="text-slate-700">{data.timestamp}</p>
            </div>

            {/* NO INVOICE & STATUS */}
          <div className="text-right">
            <p className="font-bold text-slate-700 uppercase mb-1">No. Invoice:</p>
            <p className="text-xl font-extrabold text-[#0B4B50] print:text-lg">{data.invoiceId}</p>
                <div className="mt-2">
                    <p className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${statusClasses}`}>
                        STATUS: {(data.status || "").toUpperCase()}
                    </p>
                </div>
          </div>
        </div>

        {/* === 3. TABEL ITEM (FINAL, MENGGUNAKAN ELEMEN TABLE STABIL) === */}
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden print:border print:rounded-none">
            <table className="w-full text-xs md:text-sm print:text-[11px] table-fixed">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold print:bg-gray-100">
                    <tr>
                        <th className="py-2 px-3 text-left w-2/5">Deskripsi Produk</th>
                        <th className="py-2 px-3 text-right w-1/5">Harga Satuan</th>
                        <th className="py-2 px-3 text-right w-1/10">QTY</th>
                        <th className="py-2 px-3 text-right w-1/4">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t border-slate-200">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                            {data.produk}
                        </td>
                        <td className="py-3 px-3 text-right">
                            Rp{pricePerItem.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right">
                            {data.qty}x
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-[#0B4B50] print:font-bold">
                            Rp{data.subtotal.toLocaleString("id-ID")}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* === 4. RINGKASAN & TOTAL AKHIR === */}
        <div className="mt-8 flex flex-col items-end text-sm w-full print:mt-4">
            {/* Subtotal */}
            <div className="flex justify-between w-full max-w-xs mb-1 print:max-w-full">
            <span className="text-slate-600 font-medium">Subtotal</span>
            <span className="font-semibold">
              Rp{data.subtotal.toLocaleString("id-ID")}
            </span>
          </div>

            {/* Ongkir */}
            <div className="flex justify-between w-full max-w-xs mb-1 print:max-w-full">
            <span className="text-slate-600 font-medium">Ongkos Kirim (Flat)</span>
            <span className="font-semibold">
              Rp{HARGA_ONGKIR.toLocaleString("id-ID")}
            </span>
          </div>

            {/* GRAND TOTAL */}
          <div className="flex justify-between w-full max-w-xs text-xl font-extrabold border-t-2 border-b-2 border-slate-300 py-3 mt-2 
            print:text-lg print:max-w-full print:py-2">
            <span className="text-slate-900">GRAND TOTAL</span>
            <span className="text-[#0B4B50]">
              Rp{grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* === 5. Rincian Pembayaran & Kontak CS === */}
        <div className="mt-10 grid grid-cols-2 gap-4 text-sm border-t border-slate-200 pt-6 print:mt-4 print:pt-4 print:text-[11px]">
          <div>
            <p className="font-bold text-slate-700 uppercase tracking-wide mb-2">
              Rincian Pembayaran
            </p>
            <p className="font-semibold text-slate-900">{data.paymentMethod}</p>
            <p className="text-slate-700 mt-1">
              No. Rekening: <strong className="text-lg text-red-600 print:text-base">{data.bankAccount}</strong>
            </p>
            <p className="text-slate-700">
              Atas Nama: <strong>{data.accountName}</strong>
            </p>
                {/* HIDE BUTTON SAAT PRINT */}
                <a 
                    href={`https://wa.me/${KONTAK_CS}?text=Saya%20sudah%20bayar%20invoice%20%23${data.invoiceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition shadow-md print:hidden"
                >
                    ✅ Konfirmasi Pembayaran
                </a>
          </div>

            {/* Area Tanda Tangan/Catatan */}
            <div className="text-right">
                <p className="font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Catatan:
            </p>
                <p className="text-slate-600 italic">Harap lakukan pembayaran maksimal 1x24 jam.</p>
                
                <p className="font-semibold text-slate-800 mt-8 print:mt-4">Hormat Kami,</p>
                <p className="font-bold text-[#0B4B50]">Admin KOJE24</p>
            </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center border-t border-slate-200 pt-4 print:mt-6 print:pt-3">
          <p className="text-sm font-extrabold text-slate-700 print:text-[11px]">
            TERIMA KASIH ATAS KEPERCAYAAN ANDA 🙏
          </p>
          <p className="text-[11px] text-slate-400 mt-1 print:text-[9px]">
            Invoice ini adalah bukti pembelian yang sah.
          </p>
        </div>
      </div>
    </main>
  )
}
