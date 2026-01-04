export default function DashboardHome() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">OVERVIEW</p>
        <h1 className="text-2xl md:text-3xl font-playfair font-semibold">Ringkasan KOJE24</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ini dashboard internal untuk pantau order & operasional.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
          <p className="text-xs text-gray-500">Order Hari Ini</p>
          <p className="text-2xl font-semibold mt-1">—</p>
        </div>
        <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-semibold mt-1">—</p>
        </div>
        <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-2xl font-semibold mt-1">—</p>
        </div>
      </div>

      <div className="border rounded-2xl p-4">
        <p className="font-medium">Next</p>
        <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
          <li>Tarik data Orders dari Google Sheets (list + filter)</li>
          <li>Status pesanan: pending/paid/dikirim/selesai</li>
          <li>Export laporan harian</li>
        </ul>
      </div>
    </div>
  );
}
