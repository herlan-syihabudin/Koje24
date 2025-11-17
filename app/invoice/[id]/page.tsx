import { google } from "googleapis"

// PASTIKAN SEMUA ENV INI SUDAH DISET DI VERCEL
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!
// Tambahkan ONGKIR (jika ada) - Dihapus di kode ini karena tidak ada di return getOrder kamu
// const ONGKIR = 15000 

// --- GET ORDER FUNCTION (Tidak Diubah, Hanya Dihapus Log agar Lebih Bersih) ---
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
    range: "Sheet1!A2:L999", // PASTIKAN NAMA SHEET INI SUDAH BENAR!
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
    // Tambahkan data pembayaran hardcode karena tidak ada di return object kamu
    paymentMethod: "Transfer Bank Mandiri",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}
// --------------------------------------------------------------------------

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
  
  // Logika error handling ID tidak valid / tidak ditemukan tetap sama (GOOD!)
  if (!idClean) { /* ... return error ... */ }
  const data = await getOrder(idClean)
  if (!data) { /* ... return error ... */ }

  // Harga per item dihitung
  const pricePerItem =
    data.qty && data.qty > 0 ? Math.round(data.total / data.qty) : data.total

  const statusClasses = getStatusColor(data.status);


  return (
    <main className="min-h-screen bg-slate-100 py-12 px-4 flex justify-center print:py-0">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border-t-8 border-[#0B4B50] px-10 py-10 print:shadow-none print:border-t-4 print:rounded-none">
        
        {/* === 1. HEADER PERUSAHAAN (PREMIUM LOOK) === */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <p className="text-4xl font-extrabold tracking-widest text-slate-900">
              INVOICE
            </p>
            <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <p className="font-bold text-slate-700">KOJE24 Official</p>
                <p>Jl. Jenderal Sudirman No. 24, Jakarta Selatan</p>
                <p>Tel: 08xx-xxxx-xxxx | Email: order@koje24.com</p>
            </div>
          </div>

          {/* Ganti Teks Logo dengan Image/Font yang Lebih Berkelas */}
          <div className="text-right">
                {/*  */}
                <img 
                    src="/logo-koje24.png" // PASTIKAN PATH LOGO KAMU BENAR
                    alt="Koje24 Company Logo" 
                    className="w-28 h-auto" 
                /> 
            <p className="text-xs text-slate-500 mt-1">
              Natural Cold-Pressed Juice
            </p>
          </div>
        </div>
        
        {/* === 2. INFORMASI KLIEN & INVOICE DETAIL === */}
        <div className="grid grid-cols-3 gap-4 text-xs md:text-sm mb-8">
            {/* KEPADA */}
          <div>
            <p className="font-bold text-slate-700 uppercase mb-1">Kepada:</p>
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
            <p className="text-xl font-extrabold text-[#0B4B50]">{data.invoiceId}</p>
                <div className="mt-2">
                    <p className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${statusClasses}`}>
                        STATUS: {(data.status || "").toUpperCase()}
                    </p>
                </div>
          </div>
        </div>

        {/* === 3. TABEL ITEM === */}
        <div className="mt-4 rounded-lg overflow-hidden border border-slate-300">
          <div className="grid grid-cols-4 text-xs font-bold uppercase bg-slate-200 text-slate-700 py-2 px-4 border-b border-slate-300">
            <span className="col-span-2">Deskripsi Produk</span>
            <span className="text-right">Harga Satuan</span>
            <span className="text-right">Qty / Total</span>
          </div>

          {/* BARIS ITEM */}
          <div className="grid grid-cols-4 text-sm items-center py-4 px-4 bg-white hover:bg-slate-50 transition">
            <div className="col-span-2">
              <p className="font-medium text-slate-800">{data.produk}</p>
            </div>
            <div className="text-right text-slate-700">
              Rp{pricePerItem.toLocaleString("id-ID")}
            </div>
            <div className="text-right text-slate-700 font-semibold">
              x{data.qty} ={" "}
              <span className="font-extrabold text-[#0B4B50]">
                Rp{data.total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* === 4. RINGKASAN & TOTAL AKHIR === */}
        <div className="mt-8 flex flex-col items-end text-sm w-full">
          <div className="flex justify-between w-full max-w-xs text-xl font-extrabold border-t-2 border-b-2 border-slate-300 py-3">
            <span className="text-slate-900">GRAND TOTAL</span>
            <span className="text-[#0B4B50]">
              Rp{data.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* === 5. Rincian Pembayaran (Lebih Jelas) === */}
        <div className="mt-10 grid grid-cols-2 gap-4 text-sm border-t border-slate-200 pt-6">
          <div>
            <p className="font-bold text-slate-700 uppercase tracking-wide mb-2">
              Rincian Pembayaran
            </p>
            <p className="font-semibold text-slate-900">{data.paymentMethod}</p>
            <p className="text-slate-700 mt-1">
              No. Rekening: <strong className="text-lg text-red-600">{data.bankAccount}</strong>
            </p>
            <p className="text-slate-700">
              Atas Nama: <strong>{data.accountName}</strong>
            </p>
          </div>

            {/* Area Tanda Tangan/Catatan */}
            <div className="text-right">
                <p className="font-bold text-slate-700 uppercase tracking-wide mb-4">
                    Hormat Kami,
            </p>
                <div className="h-16 w-32 ml-auto border-b border-gray-400 mb-2">
                    {/* Placeholder Tanda Tangan */}
                </div>
                <p className="font-semibold text-slate-800">(Admin KOJE24)</p>
            </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center border-t border-slate-200 pt-4">
          <p className="text-sm font-extrabold text-slate-700">
            TERIMA KASIH ATAS KEPERCAYAAN ANDA 🙏
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Invoice ini adalah bukti pembelian yang sah.
          </p>
        </div>
      </div>
    </main>
  )
}
