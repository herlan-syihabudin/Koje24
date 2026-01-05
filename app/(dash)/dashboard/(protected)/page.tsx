function StatCard({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-[11px] uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="text-lg font-semibold text-gray-900 mt-1">
        {title}
      </p>

      <div className="mt-4 h-2 w-10 rounded-full bg-gray-200" />

      <p className="text-xs text-gray-500 mt-3">
        Belum ada data
      </p>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      
      {/* STAT CARDS */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Today"
            title="Order Hari Ini"
          />
          <StatCard
            label="This Month"
            title="Total Order Bulan Ini"
          />
          <StatCard
            label="Revenue"
            title="Total Pendapatan"
          />
        </div>
      </section>

      {/* NOTE */}
      <section>
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm font-semibold text-gray-900">
            Catatan Tahap 1
          </p>

          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Ini masih tampilan kerangka dashboard.
            Fokus saat ini adalah memastikan UI rapi,
            konsisten, dan stabil sebelum masuk ke Tahap 2
            (data & tabel order).
          </p>
        </div>
      </section>

    </div>
  );
}
