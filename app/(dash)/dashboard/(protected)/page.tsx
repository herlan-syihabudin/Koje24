function StatCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <p className="text-xs tracking-wide text-gray-500">{subtitle}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{title}</p>

      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-300">—</p>
        <p className="text-xs text-gray-400 mt-1">Belum ada data</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 space-y-8">
      {/* stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard subtitle="TODAY" title="Order Hari Ini" />
        <StatCard subtitle="THIS MONTH" title="Total Order Bulan Ini" />
        <StatCard subtitle="REVENUE" title="Total Pendapatan" />
      </div>

      {/* note */}
      <div className="rounded-3xl border bg-white p-6">
        <p className="text-sm font-semibold text-gray-900">
          Catatan Tahap 1
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Ini masih tampilan kerangka dashboard. Fokus saat ini adalah
          memastikan UI rapi, konsisten, dan stabil sebelum masuk ke
          Tahap 2 (data & tabel order).
        </p>
      </div>
    </div>
  );
}
