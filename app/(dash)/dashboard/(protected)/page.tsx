import Link from "next/link";

function StatCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <div className="h-8 w-20 bg-gray-100 rounded mt-3" />
      <p className="text-xs text-gray-400 mt-2">Belum ada data</p>
    </div>
  );
}

function QuickAction({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border rounded-2xl p-4 bg-[#F7FBFB] hover:bg-[#F0FAFA] transition block"
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
      <p className="text-xs text-[#0FA3A8] font-semibold mt-3">
        Buka →
      </p>
    </Link>
  );
}

function PreviewCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="border rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-2">{desc}</p>

      <div className="mt-4 h-24 rounded-xl bg-gray-50 border border-dashed flex items-center justify-center text-xs text-gray-400">
        Placeholder (Tahap UI)
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">
          OVERVIEW
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Ringkasan KOJE24
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Dashboard internal untuk pantau order & operasional.
        </p>
      </div>

      {/* KPI CARDS */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Order Hari Ini" />
        <StatCard title="Total Order Bulan Ini" />
        <StatCard title="Total Pendapatan" />
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Quick Actions
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            title="Kelola Order"
            desc="Lihat & update status pesanan"
            href="/dashboard/orders"
          />
          <QuickAction
            title="Kelola Produk"
            desc="Atur stok & harga produk"
            href="/dashboard/products"
          />
          <QuickAction
            title="Cek Keuangan"
            desc="Pantau pembayaran & invoice"
            href="/dashboard/finance"
          />
        </div>
      </section>

      {/* PREVIEW */}
      <section className="grid gap-4 md:grid-cols-2">
        <PreviewCard
          title="Order Terbaru"
          desc="Ringkasan 5 order terakhir akan muncul di sini."
        />
        <PreviewCard
          title="Produk Terlaris"
          desc="Ranking produk terlaris akan tampil setelah data aktif."
        />
      </section>

      {/* SYSTEM NOTE */}
      <section className="border rounded-2xl p-5 bg-[#F7FBFB]">
        <p className="text-sm font-semibold text-gray-900">
          Catatan Tahap 1
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Ini masih tampilan kerangka dashboard. Fokus saat ini adalah
          memastikan UI rapi, konsisten, dan stabil sebelum masuk ke Tahap 2
          (data & tabel).
        </p>
      </section>
    </div>
  );
}
