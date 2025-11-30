// app/invoice/[id]/page.tsx
import { google } from "googleapis"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const viewport = { themeColor: "#0FA3A8" }

// 🔐 ENV
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ""
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? ""
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? ""
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n")

const KONTAK_CS = "6282213139580"
const normalize = (v: any) => String(v || "").trim()

// =========================================================
// 🧠 Fungsi proses row → object invoice
// =========================================================
function processInvoiceData(row: string[]) {
  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    status: row[8] || "Pending",
    paymentMethod: row[9] || "Transfer Bank Mandiri",
    ongkir: Number(row[10] || 0),
    grandTotal: Number(row[11] || 0),

    produkList: (() => {
      const text = row[5] || ""
      const list = text.split(",").map((p) => p.trim())
      return list.map((p) => {
        const match = p.match(/(.+)\s\((\d+)x\)/)
        return match
          ? { nama: match[1], qty: Number(match[2]), subtotal: 0 }
          : { nama: p, qty: 1, subtotal: 0 }
      })
    })(),

    subtotal: Number(row[11] || 0) - Number(row[10] || 0),
    qtyTotal: (() => {
      const text = row[5] || ""
      const list = text.split(",").map((p) => p.trim())
      return list.reduce((sum, p) => {
        const m = p.match(/\((\d+)x\)/)
        return sum + (m ? Number(m[1]) : 1)
      }, 0)
    })(),

    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}

// =========================================================
// 🔥 Ambil order dari Google Sheets
// =========================================================
async function getOrder(invoiceId: string) {
  const clean = normalize(invoiceId)
  if (!clean) return null
  if (!SHEET_ID || !PRIVATE_KEY || !CLIENT_EMAIL) return null

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A:M",
  })

  const rows = (res.data.values || []).slice(1)
  const match = rows.find((r) => normalize(r[1]) === clean)
  if (!match) return null

  const produkStr = match[5] || ""
  const produkList = produkStr.split(",").map((p: string) => {
    const m = p.match(/(.+)\s\((\d+)x\)/)
    return m
      ? { nama: m[1].trim(), qty: Number(m[2]), subtotal: 0 }
      : { nama: p.trim(), qty: 1, subtotal: 0 }
  })

  // 🔥 FIX DEPLOY (TYPE ERROR)
  const qtyTotal = produkList.reduce(
    (sum: number, p: { qty: number }) => sum + p.qty,
    0
  )

  const grandTotal = Number(match[11] || 0)
  const ongkir = Number(match[10] || 0)
  const subtotal = grandTotal - ongkir

  return {
    timestamp: match[0] ?? "",
    invoiceId: match[1] ?? "",
    nama: match[2] ?? "",
    hp: match[3] ?? "",
    alamat: match[4] ?? "",
    produkList,
    qtyTotal,
    subtotal,
    ongkir,
    grandTotal,
    status: match[8] || "Pending",
    paymentMethod: match[9] || "Transfer Bank Mandiri",
    bankAccount: "9918282983939",
    accountName: "KOJE24",
  }
}

// =========================================================
// 🎨 Status Color
// =========================================================
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-300"
    case "paid":
    case "lunas":
      return "bg-emerald-50 text-emerald-700 border-emerald-300 border"
    case "cod":
      return "bg-blue-50 text-blue-700 border-blue-300 border"
    default:
      return "bg-gray-50 text-gray-700 border-gray-300 border"
  }
}

// =========================================================
// 📄 UI HALAMAN INVOICE
// =========================================================
export default async function InvoicePage({ params }: { params: { id: string } }) {
  const raw = params.id || ""
  const clean = raw.replace(/(%0A|[\n\r\t\s]|\?.*)/g, "")
  const data = await getOrder(clean)

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
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden print:shadow-none">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-slate-200 px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold tracking-[0.15em] text-slate-900">INVOICE</h1>
            <p className="mt-2 font-semibold text-sm">KOJE24 Official</p>
            <p className="text-xs text-slate-500 leading-tight">
              Jl. Jenderal Sudirman No. 24, Jakarta Selatan
              <br /> Tel: {KONTAK_CS} • order@koje24.com
            </p>
          </div>
          <img src="/logo-koje24.png" alt="KOJE24" className="h-12 w-auto" />
        </div>

        {/* CUSTOMER INFO */}
        <div className="grid grid-cols-3 px-6 py-4 gap-4 text-[13px] border-b border-slate-100">
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">Dikirim Kepada:</p>
            <p className="font-semibold text-slate-900">{data.nama}</p>
            <p className="text-slate-600">{data.hp}</p>
            <p className="text-slate-600 max-w-[90%]">{data.alamat}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">Tanggal Pesanan:</p>
            <p className="text-slate-700">{data.timestamp}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-700 mb-1">Nomor Invoice:</p>
            <p className="text-lg font-extrabold tracking-wide text-[#0B4B50]">{data.invoiceId}</p>
            <p className={`inline-block mt-2 px-2 py-1 rounded-md text-[10px] font-bold ${statusClasses}`}>
              {data.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* PRODUK TABLE */}
        <div className="px-6 py-4">
          <table className="w-full border border-slate-300 text-sm">
            <thead className="bg-slate-100 uppercase text-[11px]">
              <tr>
                <th className="p-2 text-left w-[50%]">Produk</th>
                <th className="p-2 text-right w-[15%]">Qty</th>
                <th className="p-2 text-right w-[25%]">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.produkList.map((p: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-medium text-slate-800">{p.nama}</td>
                  <td className="p-2 text-right">{p.qty}x</td>
                  <td className="p-2 text-right font-semibold">
                    Rp{(data.subtotal / data.qtyTotal).toLocaleString("id-ID")}
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
              <span className="font-semibold">Rp{data.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span className="font-semibold">Rp{data.ongkir.toLocaleString("id-ID")}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#0B4B50]">
              <span>Total Akhir</span>
              <span>Rp{data.grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="px-6 py-6 flex justify-between text-sm items-start">
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 mb-2">Rincian Pembayaran:</p>
            <p className="font-semibold">{data.paymentMethod}</p>
            <p>No.Rek: <strong className="text-red-600">{data.bankAccount}</strong></p>
            <p>a/n <strong className="text-slate-800">{data.accountName}</strong></p>

            <a
              href={`https://wa.me/${KONTAK_CS}?text=Halo%20KOJE24,%20saya%20sudah%20melakukan%20pembayaran%20untuk%20Invoice%20${data.invoiceId}%20total%20${encodeURIComponent(
                "Rp " + data.grandTotal.toLocaleString("id-ID")
              )}`}
              target="_blank"
              className="mt-4 inline-block bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
            >
              ✅ Konfirmasi Pembayaran via WhatsApp
            </a>
          </div>

          <div className="text-right mt-4">
            <p className="font-semibold text-slate-800">Hormat Kami,</p>
            <p className="font-bold text-[#0B4B50] mt-8">Admin KOJE24</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-3 text-center text-[11px] border-t bg-slate-50">
          <strong className="text-slate-700">TERIMA KASIH TELAH MEMERCAYAI KOJE24 🙏</strong>
          <br />
          <span className="text-slate-400 text-[10px]">Invoice ini adalah bukti pembelian yang sah</span>
          <br />
          <button
            onClick={() => typeof window !== "undefined" && window.print()}
            className="mt-2 text-[#0B4B50] underline font-semibold hover:text-black"
          >
            🖨️ Download / Print Invoice
          </button>
        </div>
      </div>
    </main>
  )
}
