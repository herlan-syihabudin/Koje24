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
  const idClean = id?.trim?.() ?? ""

  if (!idClean)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600 font-semibold">
          Invoice ID tidak valid 🚫
        </p>
      </main>
    )

  const data = await getOrder(idClean)

  if (!data)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600 font-semibold">
          Invoice tidak ditemukan 🚫
        </p>
      </main>
    )

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full border border-gray-200">

        {/* HEADER */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-[#0B4B50] tracking-wide">
            KOJE24 • INVOICE
          </h1>
          <p className="text-sm text-gray-500 mt-1">{data.timestamp}</p>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-4">
          <p className="font-semibold text-lg">{data.nama}</p>
          <p className="text-gray-600 text-sm">{data.hp}</p>
          <p className="text-gray-600 text-sm">{data.alamat}</p>
        </div>

        {/* ORDER */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-4">
          <p className="font-semibold text-gray-700 mb-2">Detail Pesanan</p>

          <div className="flex justify-between text-gray-700">
            <span className="text-sm">{data.produk}</span>
            <span className="text-sm">x{data.qty}</span>
          </div>

          <div className="flex justify-between mt-3 text-lg font-bold text-[#0B4B50]">
            <span>Total</span>
            <span>Rp{data.total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex justify-between items-center mt-4">
          <p className="font-semibold text-sm text-gray-600">Status Pembayaran</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold 
          ${
            data.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
          >
            {data.status}
          </span>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Terima kasih telah order di KOJE24 🍃✨
        </p>
      </div>
    </main>
  )
}
