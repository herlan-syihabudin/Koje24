export default function CustomersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">CUSTOMERS</p>
        <h1 className="text-2xl font-semibold">Manajemen Pelanggan</h1>
        <p className="text-sm text-gray-600 mt-1">
          Data pelanggan KOJE24 dan riwayat interaksi.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <CustomerStat title="Total Pelanggan" />
        <CustomerStat title="Pelanggan Aktif" />
        <CustomerStat title="Pelanggan Baru Bulan Ini" />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold">Daftar Pelanggan</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Kontak</th>
                <th className="px-4 py-3 text-left">Kota</th>
                <th className="px-4 py-3 text-right">Total Order</th>
                <th className="px-4 py-3 text-right">Total Belanja</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Belum ada data pelanggan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTE */}
      <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan Tahap E1</p>
        <p className="text-sm text-gray-600 mt-1">
          Fokus tahap ini adalah struktur & tampilan profesional.
          Data pelanggan akan diaktifkan setelah modul order stabil.
        </p>
      </div>

    </div>
  );
}

/* --- COMPONENT KECIL --- */

function CustomerStat({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-3xl font-semibold mt-2">—</p>
      <p className="text-xs text-gray-500 mt-1">Belum ada data</p>
    </div>
  );
}
