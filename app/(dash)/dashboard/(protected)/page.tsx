import Link from "next/link";

/* =====================
   KPI CARD
===================== */
function StatCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </p>

      <div className="mt-4 h-9 w-24 rounded bg-gray-100" />

      <p className="text-xs text-gray-400 mt-3">
        Belum ada data
      </p>
    </div>
  );
}

/* =====================
   QUICK ACTION
===================== */
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
      className="rounded-2xl border bg-[#F7FBFB] p-5 transition hover:bg-[#EEF9F9] block"
    >
      <p className="text-sm font-semibold text-gray-900">
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {desc}
      </p>
      <p className="text-xs font-semibold text-[#0FA3A8] mt-4">
        Buka →
      </p>
    </Link>
  );
}

/* =====================
   PREVIEW CARD
===================== */
function PreviewCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">
        {title}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {desc}
      </p>

      <div className="mt-5 h-28 rounded-xl border border-dashed bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        Placeholder (Tahap UI)
      </div>
    </div>
  );
}

/* =====================
   DASHBOARD HOME
===================== */
export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* PAGE HEADER */}
      <section>
        <p className="text-xs tracking-[0.3em] text-[#0FA3A8] font-semibold">
          OVERVIEW
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 mt-1">
          Ringkasan KOJE24
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Dashboard internal untuk memantau order, produk, dan operasional KOJE24 secara terpusat.
        </p>
      </section>

      {/* KPI */}
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard title="Order Hari Ini" />
        <StatCard title="Total Order Bulan Ini" />
        <StatCard title="Total Pendapatan" />
      </section>

      {/* QUICK ACTION */}
      <section>
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Akses Cepat
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          <QuickAction
            title="Kelola Order"
            desc="Lihat & update status pesanan pelanggan"
            href="/dashboard/orders"
          />
          <QuickAction
            title="Kelola Produk"
            desc="Atur stok, harga, dan visibilitas produk"
            href="/dashboard/products"
          />
          <QuickAction
            title="Cek Keuangan"
            desc="Pantau pembayaran, invoice, dan laporan"
            href="/dashboard/finance"
          />
        </div>
      </section>

      {/* PREVIEW */}
      <section className="grid gap-5 md:grid-cols-2">
        <PreviewCard
          title="Order Terbaru"
          desc="Ringkasan 5 order terakhir akan tampil di sini."
        />
        <PreviewCard
          title="Produk Terlaris"
          desc="Ranking produk terlaris berdasarkan penjualan."
        />
      </section>

      {/* SYSTEM NOTE */}
      <section className="rounded-2xl border bg-[#F7FBFB] p-6">
        <p className="text-sm font-semibold text-gray-900">
          Catatan Sistem
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Dashboard saat ini berada pada Tahap UI Final. Seluruh struktur,
          navigasi, dan layout telah dikunci sebelum integrasi data dimulai.
        </p>
      </section>
    </div>
  );
}
