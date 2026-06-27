// app/(dash)/dashboard/(protected)/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SalesChart from "@/components/dash/SalesChart";
import FinanceChart from "@/components/dash/FinanceChart";

/* =====================
   HELPER
===================== */
function formatRupiah(value?: number | null) {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "Rp 0";
  return "Rp " + value.toLocaleString("id-ID");
}

/* =====================
   LOADING SKELETON
===================== */
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 pb-8">
      {/* Skeleton KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mt-3"></div>
          </div>
        ))}
      </div>

      {/* Skeleton Charts */}
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-white p-6 shadow-sm animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================
   ERROR CARD
===================== */
function ErrorCard({ message }: { message: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-semibold">⚠️ {message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-600 underline"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

/* =====================
   KPI CARD
===================== */
function StatCard({
  title,
  value,
}: {
  title: string;
  value?: number | string | null;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-gray-900">
        {value ?? "—"}
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
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
      <p className="text-xs font-semibold text-[#0FA3A8] mt-4">Buka →</p>
    </Link>
  );
}

/* =====================
   DASHBOARD HOME
===================== */
export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [todayOrders, setTodayOrders] = useState<number | null>(null);
  const [monthOrders, setMonthOrders] = useState<number | null>(null);
  const [finance, setFinance] = useState<any | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  
  // 🔥 BARU: State untuk previous finance data (trend analysis)
  const [previousFinance, setPreviousFinance] = useState<any | null>(null);

  // 🔥 SATU FETCH DENGAN PROMISE.ALL
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔥 BARU: Fetch data bulan ini dan bulan lalu
        const [statsRes, financeRes, productsRes, prevFinanceRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/finance"),
          fetch("/api/dashboard/products-top"),
          fetch("/api/dashboard/finance?period=previous"), // untuk trend
        ]);

        const [stats, financeData, products, prevFinanceData] = await Promise.all([
          statsRes.json(),
          financeRes.json(),
          productsRes.json(),
          prevFinanceRes.json(),
        ]);

        if (!isMounted) return;

        // Stats
        if (stats?.success) {
          setTodayOrders(stats.todayOrders ?? 0);
          setMonthOrders(stats.monthOrders ?? 0);
        }

        // Finance
        if (financeData?.success) {
          setFinance(financeData);
        }

        // 🔥 BARU: Previous finance data
        if (prevFinanceData?.success) {
          setPreviousFinance(prevFinanceData);
        }

        // Products
        if (products?.success) {
          setTopProducts(products.products ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        if (isMounted) {
          setError("Gagal memuat data dashboard. Periksa koneksi internet Anda.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorCard message={error} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 pb-8">
      {/* KPI + INSIGHT (COMPACT) */}
      <section className="space-y-3">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Order Hari Ini" value={todayOrders} />
          <StatCard title="Total Order Bulan Ini" value={monthOrders} />
          <StatCard
            title="Total Pendapatan"
            value={finance ? formatRupiah(finance.summary?.totalRevenue) : "—"}
          />
        </div>

        {finance?.insights && (
          <div className="rounded-xl border bg-[#F7FBFB] px-4 py-2 text-sm text-gray-700 flex flex-wrap gap-4">
            <span>
              {finance.insights.revenueTrend?.status === "up" && "📈"}
              {finance.insights.revenueTrend?.status === "down" && "📉"}
              {finance.insights.revenueTrend?.status === "flat" && "➖"}{" "}
              Pendapatan{" "}
              <b>
                {finance.insights.revenueTrend?.status === "up"
                  ? "naik"
                  : finance.insights.revenueTrend?.status === "down"
                  ? "turun"
                  : "stabil"}
              </b>{" "}
              {finance.insights.revenueTrend?.percent || 0}%
            </span>

            {finance.insights.topProduct?.name && (
              <span>
                🔥 Produk dominan: <b>{finance.insights.topProduct.name}</b>
              </span>
            )}

            {finance.insights.paymentRisk?.warning && (
              <span className="text-orange-600">
                ⚠️ COD {finance.insights.paymentRisk.codRatio || 0}%
              </span>
            )}
          </div>
        )}
      </section>

      {/* SALES + FINANCE */}
      <section className="grid gap-5 lg:grid-cols-[2fr_1fr] items-start">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <SalesChart />
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold mb-3">Ringkasan Keuangan</p>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Total Pendapatan</p>
                <p className="text-xl font-semibold">
                  {finance ? formatRupiah(finance.summary?.totalRevenue) : "—"}
                </p>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Transfer / QRIS</span>
                <span className="font-semibold">
                  {finance ? formatRupiah(finance.methods?.transfer?.amount) : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">COD</span>
                <span className="font-semibold">
                  {finance ? formatRupiah(finance.methods?.cod?.amount) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* 🔥 UPDATE: FinanceChart dengan loading dan previousData */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <FinanceChart 
              data={finance?.chart || []}
              loading={loading}
              previousData={previousFinance?.chart || []}
            />
          </div>
        </div>
      </section>

      {/* QUICK ACTION */}
      <section>
        <p className="text-sm font-semibold text-gray-900 mb-4">Akses Cepat</p>
        <div className="grid gap-5 md:grid-cols-3">
          <QuickAction
            title="Kelola Order"
            desc="Lihat & update status pesanan pelanggan"
            href="/dashboard/orders"
          />
          <QuickAction
            title="Kelola Produk"
            desc="Atur stok & harga produk"
            href="/dashboard/products"
          />
          <QuickAction
            title="Cek Keuangan"
            desc="Pantau pembayaran & laporan"
            href="/dashboard/finance"
          />
        </div>
      </section>

      {/* PRODUK TERLARIS */}
      <section>
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Produk Terlaris Bulan Ini
        </p>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Belum ada produk terjual bulan ini
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      #{i + 1} {p.produk}
                    </p>
                    <p className="text-xs text-gray-500">
                      Terjual {p.totalQty} pcs
                    </p>
                  </div>
                  <p className="font-semibold">{formatRupiah(p.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
