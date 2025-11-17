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

export default async function InvoicePage(props: any) {
  const { id } = await props.params
  console.log("🚀 PARAMS FIXED:", id)

  const idClean = id?.trim?.() ?? ""

  if (!idClean) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice ID tidak valid 🚫
        </h2>
      </main>
    )
  }

  const data = await getOrder(idClean)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan di database 🚫
        </h2>
      </main>
    )
  }

  return (
  <main className="min-h-screen bg-gray-100 py-10 px-4">
    <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-xl border border-gray-200 p-8">
      
      {/* HEADER */}
      <div className="border-b pb-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B4B50] tracking-wide">
            INVOICE
          </h1>
          <p className="text-xs text-gray-500 mt-1">#{data.invoiceId}</p>
        </div>

        {/* Logo KOJE24 */}
        <img
          src="/koje24-logo.png" // Ganti sesuai lokasi logo kamu
          alt="KOJE24"
          className="h-12 object-contain"
        />
      </div>

      {/* CUSTOMER INFO */}
      <div className="mb-6 text-sm">
        <p className="text-gray-700 font-semibold">{data.nama}</p>
        <p className="text-gray-600">{data.hp}</p>
        <p className="text-gray-600">{data.alamat}</p>
        <p className="text-gray-400 mt-2">
          {data.timestamp}
        </p>
      </div>

      {/* ORDER DETAIL */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="font-bold text-gray-700 mb-2">Detail Pesanan:</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-700">{data.produk}</span>
          <span className="font-semibold">x{data.qty}</span>
        </div>

        <div className="flex justify-between border-t pt-3 mt-3">
          <span className="text-gray-500 text-sm">Total</span>
          <span className="font-bold text-lg text-[#0B4B50]">
            Rp{data.total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* PAYMENT STATUS */}
      <div className="mt-6 py-3 px-4 rounded-lg border text-sm">
        <span className="text-gray-500">Status Pembayaran:</span>
        <span
          className={`ml-2 font-bold ${
            data.status === "Pending"
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {data.status}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="mt-8 flex gap-3">
        <a
          href="https://wa.me/628xxxxxxxxx?text=Halo%20KOJE24,%20saya%20sudah%20order!" // ganti no WA kamu
          className="flex-1 bg-[#0B4B50] text-white py-3 rounded-lg font-semibold text-center hover:bg-[#09393C] transition"
        >
          Konfirmasi via WhatsApp
        </a>

        <button
          onClick={() => window.print()}
          className="px-4 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 font-medium"
        >
          Cetak
        </button>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-[11px] text-center text-gray-400 mt-6">
        Terima kasih telah order KOJE24! 🍃✨
      </p>
    </div>
  </main>
)

