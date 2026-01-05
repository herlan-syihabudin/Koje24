export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* header */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">
          ORDERS
        </p>
        <h1 className="text-2xl font-semibold text-gray-900">
          Manajemen Order
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Daftar dan status pesanan pelanggan.
        </p>
      </div>

      {/* placeholder table */}
      <div className="border rounded-2xl bg-white p-6">
        <p className="text-sm font-semibold mb-2">
          Tabel Order (Tahap UI)
        </p>

        <div className="text-sm text-gray-500">
          Belum ada data order.
          <br />
          Data akan diaktifkan pada Tahap 3.
        </div>
      </div>
    </div>
  );
}
