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
    status: row[8] ?? "Pending",
  }
}

export default async function InvoicePage(props: any) {
  const { id } = await props.params
  console.log("🚀 PARAMS FIXED:", id)

  const idClean = id?.trim?.() ?? ""

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

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan di database 🚫
        </h2>
      </main>
    )
  }

  // HARGA PER ITEM (sementara dari total / qty, nanti bisa diganti dari data asli)
  const pricePerItem =
    data.qty && data.qty > 0 ? Math.round(data.total / data.qty) : data.total

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 px-8 py-8">
        {/* HEADER ATAS */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-6">
          <div>
            <p className="text-3xl font-extrabold tracking-[0.18em] text-slate-900">
              INVOICE
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#0B4B50] tracking-wide">
              KOJE<span className="text-amber-400">24</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Natural Cold-Pressed Juice
            </p>
          </div>
        </div>

        {/* KEPADA / TANGGAL / NO INVOICE */}
        <div className="grid grid-cols-2 gap-4 text-xs md:text-sm mb-6">
          <div className="space-y-1">
            <p className="font-semibold text-slate-700 uppercase tracking-wide">
              Kepada:
            </p>
            <p className="font-semibold text-slate-900">{data.nama}</p>
            <p className="text-slate-600">{data.hp}</p>
            <p className="text-slate-600 leading-snug">{data.alamat}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="font-semibold text-slate-700 uppercase tracking-wide">
              Tanggal:
            </p>
            <p className="text-slate-700">{data.timestamp}</p>
            <p className="font-semibold text-slate-700 uppercase tracking-wide mt-3">
              No. Invoice:
            </p>
            <p className="text-slate-800">{data.invoiceId}</p>
          </div>
        </div>

        {/* TABEL ITEM */}
        <div className="mt-4">
          <div className="grid grid-cols-4 text-[11px] md:text-xs font-semibold tracking-wide text-slate-600 uppercase border-y border-slate-300 py-2">
            <span className="col-span-2 pl-2">Keterangan</span>
            <span className="text-right">Harga</span>
            <span className="text-right pr-2">Jml / Total</span>
          </div>

          {/* BARIS ITEM (sementara 1 produk dari data sekarang) */}
          <div className="grid grid-cols-4 text-sm items-center border-b border-slate-200 py-3 bg-slate-50/70">
            <div className="col-span-2 pl-2">
              <p className="font-medium text-slate-800">{data.produk}</p>
            </div>
            <div className="text-right text-slate-700">
              Rp{pricePerItem.toLocaleString("id-ID")}
            </div>
            <div className="text-right pr-2 text-slate-700">
              x{data.qty} ={" "}
              <span className="font-semibold">
                Rp{data.total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* RINGKASAN TOTAL */}
        <div className="mt-6 flex flex-col items-end gap-1 text-sm">
          {/* kalau nanti mau ada subtotal/pajak tinggal tambahin di sini */}
          <div className="flex justify-between w-full max-w-xs">
            <span className="text-slate-600 font-semibold">TOTAL</span>
            <span className="font-extrabold text-slate-900">
              Rp{data.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* PEMBAYARAN */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-xs md:text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-slate-700 uppercase tracking-wide">
              Pembayaran:
            </p>
            <p className="text-slate-700">Transfer Bank Mandiri</p>
            <p className="text-slate-700">
              No. Rek: <span className="font-semibold">9918282983939</span>
            </p>
            <p className="text-slate-700">
              A/N: <span className="font-semibold">KOJE24</span>
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-semibold text-slate-700 uppercase tracking-wide">
              Status:
            </p>
            <p
              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold 
              ${
                (data.status || "").toLowerCase() === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {(data.status || "").toUpperCase()}
            </p>
          </div>
        </div>

        {/* FOOTER TERIMA KASIH */}
        <div className="mt-10 border-t border-slate-200 pt-4 text-center">
          <p className="text-xs md:text-sm font-semibold text-slate-700 tracking-wide">
            TERIMAKASIH ATAS PEMBELIAN ANDA
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            KOJE24 • Natural Cold-Pressed Juice • No Sugar • No Preservatives
          </p>
        </div>
      </div>
    </main>
  )
}
