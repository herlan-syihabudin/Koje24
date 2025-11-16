import { SheetsOrder } from "@/types/order"

async function getOrderData(invoiceId: string) {
  return {
    invoiceId,
    nama: "Loading...",
    alamat: "Loading...",
    produk: "Loading...",
    total: 0,
  }
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string }
}) {
  const data = await getOrderData(params.id)

  return (
    <main className="min-h-screen bg-white px-6 py-16 flex justify-center">
      <div className="max-w-lg w-full border rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-[#0B4B50] mb-6">
          Invoice #{data.invoiceId}
        </h1>

        <p className="text-[#0B4B50] text-sm mb-1">Nama: {data.nama}</p>
        <p className="text-[#0B4B50] text-sm mb-1">Alamat: {data.alamat}</p>
        <p className="text-[#0B4B50] text-sm">Total: Rp{data.total}</p>

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-400">Payment status: Pending</p>
        </div>
      </div>
    </main>
  )
}
