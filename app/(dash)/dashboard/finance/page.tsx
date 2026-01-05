export default function FinancePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">FINANCE</p>
        <h1 className="text-2xl font-semibold">Keuangan KOJE24</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ringkasan pendapatan, pembayaran, dan invoice.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-4">
        <FinanceStat title="Total Pendapatan" />
        <FinanceStat title="Pembayaran Masuk" />
        <FinanceStat title="Invoice Pending" />
        <FinanceStat title="Refund / Retur" />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Riwayat Pembayaran</h2>
          <span className="text-xs text-gray-400">UI Only</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  Belum ada data pembayaran.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTE */}
      <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan Tahap E2</p>
        <p className="text-sm text-gray-600 mt-1">
          Modul keuangan masih tahap UI.
          Data akan diaktifkan setelah order & pembayaran terkunci strukturnya.
        </p>
      </div>

    </div>
  );
}

/* --- COMPONENT --- */

function FinanceStat({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-2">—</p>
      <p className="text-xs text-gray-500 mt-1">Belum ada data</p>
    </div>
  );
}
