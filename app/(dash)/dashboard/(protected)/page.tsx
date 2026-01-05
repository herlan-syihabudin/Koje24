export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Order Hari Ini" />
        <StatCard title="Total Order Bulan Ini" />
        <StatCard title="Total Pendapatan" />
      </div>

      {/* note */}
      <div className="border rounded-2xl p-5 bg-white">
        <p className="text-sm font-semibold">Catatan Tahap 1</p>
        <p className="text-sm text-gray-600 mt-1">
          Ini baru kerangka. Kalau ini sudah rapi & stabil, baru kita masuk
          Tahap 2: tabel order + status.
        </p>
      </div>
    </div>
  );
}
