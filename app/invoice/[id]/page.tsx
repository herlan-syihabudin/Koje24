import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!

async function getOrder(invoiceId: string) {
  console.log("🔍 Invoice ID dari URL (RAW):", invoiceId)

  const idClean = invoiceId?.trim?.() ?? ""
  console.log("✨ Invoice ID clean:", idClean)

  if (!idClean) {
    console.log("❌ Invoice ID kosong!")
    return null
  }

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
  console.log("📑 Jumlah Data:", rows.length)

  const row =
    rows.find((r) => String(r?.[1] || "").trim() === idClean) ||
    rows.find((r) => String(r?.[11] || "").trim().includes(idClean))

  if (!row) {
    console.log("❌ Invoice", idClean, "tidak ditemukan di Sheet!")
    return null
  }

  return {
    timestamp: row[0] ?? "",
    invoiceId: row[1] ?? "",
    nama: row[2] ?? "",
    hp: row[3] ?? "",
    alamat: row[4] ?? "",
    produk: row[5] ?? "",
    qty: Number(row[6] ?? 0),
    total: Number(row[7] ?? 0),
    status: row[8] ?? "Unknown",
    paymentMethod: row[9] ?? "",
    bankInfo: row[10] ?? "",
    linkInvoice: row[11] ?? "",
  }
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string }
}) {
  console.log("🚀 PARAMS:", params)

  const id = params?.id?.trim?.() ?? ""

  if (!id) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice ID tidak valid 🚫
        </h2>
      </main>
    )
  }

  const data = await getOrder(id)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan di database 🚫
        </h2>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* HEADER BRAND + NOMOR INVOICE */}
        <div className="px-6 md:px-8 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[#0B4B50]">
              KOJE<span className="text-amber-400">24</span>
            </div>
            <p className="text-xs md:text-sm text-slate-500">
              Natural Cold-Pressed Juice • No Sugar • No Preservatives
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Invoice
            </p>
            <p className="text-sm md:text-base font-semibold text-[#0B4B50]">
              #{data.invoiceId}
            </p>
            <p className="text-xs text-slate-500 mt-1">{data.timestamp}</p>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 md:px-8 py-6 space-y-6">
          {/* DATA CUSTOMER */}
          <section className="space-y-1">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Data Pemesan
            </h3>
            <div className="mt-1 text-sm space-y-0.5">
              <p className="font-semibold text-slate-800">{data.nama}</p>
              <p className="text-slate-600">{data.hp}</p>
              <p className="text-slate-600 leading-snug">{data.alamat}</p>
            </div>
          </section>

          {/* RINCIAN PESANAN */}
          <section className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">
              Rincian Pesanan
            </h3>

            <div className="w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800">
                  {data.produk}
                </span>
                <span className="text-slate-600">x{data.qty}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>Rp{data.total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg md:text-xl font-extrabold text-[#0B4B50]">
                Rp{data.total.toLocaleString("id-ID")}
              </span>
            </div>
          </section>

          {/* STATUS PEMBAYARAN */}
          <section className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-600">
              Status Pembayaran
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                (data.status || "").toLowerCase() === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {(data.status || "").toUpperCase()}
            </span>
          </section>

          {/* CATATAN SINGKAT */}
          <section className="pt-1">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Silakan selesaikan pembayaran sesuai instruksi yang dikirim oleh
              admin KOJE24. Simpan atau screenshot halaman ini sebagai bukti
              pemesanan Anda.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
