export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">PRODUCTS</p>
        <h1 className="text-2xl font-semibold text-[#0B4B50]">
          Manajemen Produk
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Kelola katalog, stok, dan harga produk KOJE24.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <input
          placeholder="Cari produk..."
          className="border rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
        />

        <button className="bg-[#0FA3A8] text-white px-5 py-2 rounded-xl text-sm font-semibold">
          + Tambah Produk
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border rounded-2xl bg-white p-4 hover:shadow-md transition"
          >
            <div className="h-40 rounded-xl bg-gray-100 mb-4 flex items-center justify-center text-gray-400">
              Thumbnail
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-gray-800">
                KOJE Healthy Juice {i}
              </p>
              <p className="text-sm text-gray-500">Rp 18.000</p>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Aktif
                </span>

                <button className="text-xs text-[#0FA3A8] font-semibold">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan Tahap D</p>
        <p className="text-sm text-gray-600 mt-1">
          Ini masih tahap UI. Data produk akan diaktifkan setelah struktur final
          dikunci.
        </p>
      </div>
    </div>
  );
}
