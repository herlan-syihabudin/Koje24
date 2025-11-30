import { google } from "googleapis"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const viewport = {
  themeColor: "#0FA3A8",
}

// 🔐 ENV
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""

const PRIVATE_KEY = PRIVATE_KEY_RAW
  .replace(/\\n/g, "\n")
  .replace(/\\\\n/g, "\n")

// CS & Footer
const KONTAK_CS = "6282213139580"

// helper normalize
const normalize = (v: any) => String(v || "").trim()

// 🟣 LOG DEBUG (aman di production, tidak crash)
function logDebug(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[INVOICE]", ...args)
  }
}

// Helper function untuk memproses data invoice yang ditemukan
function processInvoiceData(sameInvoice: string[][]) {
  const first = sameInvoice[0]

  const produkList = sameInvoice.map((r: string[]) => {
    const qty = Number(r[6] || 0)
    const subtotal = Number(r[7] || 0)
    return {
      nama: r[5] || "",
      qty,
      subtotal,
    }
  })

  const qtyTotal = produkList.reduce((s, p) => s + p.qty, 0)
  const subtotal = produkList.reduce((s, p) => s + p.subtotal, 0)
  const ongkir = Number(first[10] || 0)
  const grandTotal = subtotal + ongkir

  return {
    timestamp: first[0] ?? "",
    invoiceId: first[1] ?? "",
    nama: first[2] ?? "",
    hp: first[3] ?? "",
    alamat: first[4] ?? "",
    produkList,
    qtyTotal,
    subtotal,
    ongkir,
    grandTotal,
    status: first[8] || "Pending",
    paymentMethod: first[9] || "Transfer Bank Mandiri",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}


/* ==============================================================================
   🔥 GET ORDER FROM GOOGLE SHEET — DENGAN RETRY LOGIC (MENGATASI LATENSI)
============================================================================== */
async function getOrder(invoiceId: string) {
  const clean = normalize(invoiceId)
  if (!clean) return null

  if (!SHEET_ID || !PRIVATE_KEY || !CLIENT_EMAIL) {
    console.error("❌ ENV Google Sheet belum lengkap")
    return null
  }

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })

  // --- 🚀 Logic Retry Tambahan ---
  const MAX_RETRIES = 3 // Coba ulang maksimal 3 kali
  const DELAY_MS = 1000 // Jeda 1 detik antar percobaan (untuk memberi waktu Sheet sinkronisasi)

  logDebug(`Mulai pencarian invoice ${clean} dengan ${MAX_RETRIES} percobaan...`)

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Sheet1!A:Z",
      })

      const allRows = res.data.values || []
      const rows = allRows.slice(1) // skip header

      logDebug(`Percobaan ke-${attempt}: Total baris ditemukan: ${rows.length}`)

      // ⛳ Matching URL/ID
      const sameInvoice = rows.filter((r: string[]) => {
        const colInvoice = normalize(r[1])
        const colUrl = normalize(r[12])   // kolom M index = 12
        return (
          colInvoice === clean ||
          colUrl.endsWith(clean) ||
          colUrl.includes(`/invoice/${clean}`) ||
          colUrl.includes(clean)
        )
      })

      if (sameInvoice.length > 0) {
        logDebug(`✅ Ditemukan pada percobaan ke-${attempt}.`)
        return processInvoiceData(sameInvoice)
      }

      logDebug(`Percobaan ke-${attempt}: Gagal menemukan invoice ${clean}.`)

      // Jika ini bukan percobaan terakhir, tunggu sebelum mencoba lagi
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      }
    } catch (error) {
      console.error(`❌ Gagal fetch Google Sheet pada percobaan ke-${attempt}:`, error)
      // Jangan retry jika ini adalah error yang fatal, tapi kita tetap coba 
      // untuk mengatasi potensi error sementara.
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      }
    }
  }

  logDebug(`❌ Gagal menemukan invoice ${clean} setelah ${MAX_RETRIES} percobaan.`)
  return null
}

/* ==============================================================================
   💠 STATUS BADGE COLOR
============================================================================== */
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

/* ==============================================================================
   🔥 PAGE UI
============================================================================== */
export default async function InvoicePage({ params }: { params: { id: string } }) {
  const rawId = params?.id || ""
  const id = normalize(rawId)
  const safeId = id.replace(/(%0A|[\n\r\t\s]|\?.*)/g, "")

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
              {data.produkList.map((p: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-3 font-medium text-slate-800">{p.nama}</td>
                  <td className="p-3 text-right">
                    Rp{(p.qty > 0
                      ? Math.round(p.subtotal / p.qty)
                      : p.subtotal
                    ).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-right text-slate-800">
                    {p.qty}x
                  </td>
                  <td className="p-3 text-right font-bold text-[#0B4B50]">
                    Rp{p.subtotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="px-6 py-4 flex justify-end text-sm border-b">
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
                Rp{data.ongkir.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#0B4B50]">
              <span>TOTAL AKHIR</span>
              <span>Rp{data.grandTotal.toLocaleString("id-ID")}</span>
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
              No.Rek:{" "}
              <strong className="text-red-600">{data.bankAccount}</strong>
            </p>
            <p>
              a/n{" "}
              <strong className="text-slate-800">{data.accountName}</strong>
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
