export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">ORDERS</p>
        <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
          Manajemen Order
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Daftar dan status pesanan pelanggan.
        </p>
      </div>

      {/* TABS STATUS */}
      <div className="flex flex-wrap gap-2">
        {[
          "Semua",
          "Pending",
          "Diproses",
          "Dikirim",
          "Selesai",
        ].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 rounded-full text-sm border bg-white hover:bg-[#F7FBFB] transition"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE PLACEHOLDER */}
      <div className="border rounded-2xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="text-sm font-semibold">Tabel Order (Tahap UI)</p>
          <p className="text-xs text-gray-500 mt-1">
            Data akan diaktifkan pada Tahap berikutnya.
          </p>
        </div>

        <div className="p-10 text-center text-gray-400 text-sm">
          Belum ada data order.
        </div>
      </div>

      {/* NOTE */}
      <div className="border rounded-2xl p-5 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan Tahap C1</p>
        <p className="text-sm text-gray-600 mt-1">
          Ini masih tampilan UI. Fokus tahap ini adalah memastikan navigasi,
          layout, dan struktur halaman Order sudah final sebelum data diaktifkan.
        </p>
      </div>
    </div>
  );
}
