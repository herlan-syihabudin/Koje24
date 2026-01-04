function StatCard({ title }: { title: string }) {
  return (
    <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">—</p>
      <p className="text-xs text-gray-500 mt-1">Belum tarik data</p>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Order Hari Ini" />
        <StatCard title="Total Order Bulan Ini" />
        <StatCard title="Total Pendapatan" />
      </div>

      <div className="border rounded-2xl p-5">
        <p className="text-sm font-semibold">Catatan Tahap 1</p>
        <p className="text-sm text-gray-600 mt-1">
          Ini baru kerangka. Kalau ini udah rapi & stabil, baru kita masuk Tahap 2:
          tabel order + status.
        </p>
      </div>
    </div>
  );
}
