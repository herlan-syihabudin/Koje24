// app/invoice/[id]/page.tsx
import { google } from "googleapis"
import { SheetsOrder } from "@/types/order"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SHEET_ID = process.env.SHEET_ID

async function getOrderData(invoiceId: string): Promise<SheetsOrder | null> {
  if (!SHEET_ID) return null

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY || "{}"),
    scopes: SCOPES,
  })

  const client = await auth.getClient()
  const sheets = google.sheets({ version: "v4", auth: client as any })

  // 🔍 Ambil data dari Sheet1 (skip baris header)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A2:L999",
  })

  const rows = res.data.values || []

  const row = rows.find((r) => r[1] === invoiceId) // kolom B = InvoiceID
  if (!row) return null

  return {
    timestamp: row[0] || "",
    invoiceId: row[1] || "",
    nama: row[2] || "",
    hp: row[3] || "",
    alamat: row[4] || "",
    produk: row[5] || "",
    qty: row[6] || "",
    total: Number(row[7] || 0),
    status: row[8] || "",
    paymentMethod: row[9] || "",
    bankInfo: row[10] || "",
    linkInvoice: row[11] || "",
  }
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string }
}) {
  const data = await getOrderData(params.id)

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f5f7f7] px-6 py-16 flex justify-center">
        <div className="max-w-lg w-full border rounded-2xl shadow-md p-8 bg-white">
          <h1 className="text-2xl font-bold text-[#0B4B50] mb-4">
            Invoice tidak ditemukan
          </h1>
          <p className="text-sm text-gray-600">
            Pastikan link invoice benar atau hubungi admin KOJE24.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f7f7] px-6 py-16 flex justify-center">
      <div className="max-w-lg w-full border rounded-2xl shadow-md p-8 bg-white">
        <h1 className="text-2xl font-bold text-[#0B4B50] mb-2">
          Invoice #{data.invoiceId}
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Dibuat: {data.timestamp}
        </p>

        <div className="space-y-1 text-sm text-[#0B4B50] mb-6">
          <p><span className="font-semibold">Nama:</span> {data.nama}</p>
          {data.hp && data.hp !== "-" && (
            <p><span className="font-semibold">HP:</span> {data.hp}</p>
          )}
          <p><span className="font-semibold">Alamat:</span> {data.alamat}</p>
        </div>

        <div className="border-t pt-4 mb-4">
          <h2 className="font-semibold text-[#0B4B50] mb-2 text-sm">
            Rincian Pesanan
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {data.produk}
          </p>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-[#0B4B50]">
            Rp{data.total.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="mt-6 border-t pt-4 text-sm">
          <p className="text-gray-500">
            Status pembayaran:{" "}
            <span className="font-semibold text-[#E8A200]">
              {data.status || "Pending"}
            </span>
          </p>
          {data.paymentMethod && (
            <p className="text-gray-500">
              Metode pembayaran: <span className="font-semibold">{data.paymentMethod}</span>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
