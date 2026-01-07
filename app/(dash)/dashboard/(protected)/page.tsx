"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SalesChart from "@/components/dash/SalesChart";
import FinanceChart from "@/components/dash/FinanceChart";

/* =====================
   HELPER
===================== */
function formatRupiah(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return "Rp " + value.toLocaleString("id-ID");
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
      <p className="mt-4 text-3xl font-semibold text-gray-900">
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
  const [todayOrders, setTodayOrders] = useState<number | null>(null);
  const [monthOrders, setMonthOrders] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // 🔥 SATU SUMBER KEUANGAN
  const [finance, setFinance] = useState<any | null>(null);

  /* KPI */
  useEffect(() => {
    fetch("/api/dashboard/stats", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setTodayOrders(data.todayOrders ?? 0);
          setMonthOrders(data.monthOrders ?? 0);
          setTotalRevenue(data.totalRevenue ?? 0);
        }
      });
  }, []);

  /* 🔥 FINANCE (SUMBER TUNGGAL) */
  useEffect(() => {
    fetch("/api/dashboard/finance", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setFinance(data);
      });
  }, []);

  /* ORDER TERBARU */
  useEffect(() => {
    fetch("/api/dashboard/orders-latest", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setLatestOrders(data.orders);
      });
  }, []);

  /* PRODUK TERLARIS */
  useEffect(() => {
    fetch("/api/dashboard/products-top", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setTopProducts(data.products);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* KPI */}
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard title="Order Hari Ini" value={todayOrders} />
        <StatCard title="Total Order Bulan Ini" value={monthOrders} />
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(finance?.summary.totalRevenue)}
        />
      </section>

       {/* 🔥 INSIGHT OTOMATIS */}
{finance?.insights && (
  <section className="rounded-2xl border bg-[#F7FBFB] p-5 space-y-2">
    <p className="text-sm text-gray-800">
      {finance.insights.revenueTrend.status === "up" && "📈"}
      {finance.insights.revenueTrend.status === "down" && "📉"}
      {finance.insights.revenueTrend.status === "flat" && "➖"}
      {" "}
      Pendapatan{" "}
      <strong>
        {finance.insights.revenueTrend.status === "up"
          ? "meningkat"
          : finance.insights.revenueTrend.status === "down"
          ? "menurun"
          : "stabil"}
      </strong>{" "}
      sebesar{" "}
      <strong>{finance.insights.revenueTrend.percent}%</strong>{" "}
      dibanding 7 hari sebelumnya
    </p>

    {finance.insights.topProduct?.name && (
      <p className="text-sm text-gray-800">
        🔥 Produk dominan bulan ini:{" "}
        <strong>{finance.insights.topProduct.name}</strong>{" "}
        (kontribusi{" "}
        <strong>{finance.insights.topProduct.contribution}%</strong>{" "}
        dari total penjualan)
      </p>
    )}

    {finance.insights.paymentRisk.warning && (
      <p className="text-sm text-orange-600">
        ⚠️ <strong>{finance.insights.paymentRisk.codRatio}%</strong>{" "}
        transaksi masih COD — pertimbangkan promo Transfer / QRIS
      </p>
    )}
  </section>
)}

      {/* SALES CHART */}
      <section>
        <SalesChart />
      </section>

      {/* 💰 RINGKASAN KEUANGAN */}
      <section>
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Ringkasan Keuangan
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Pendapatan
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {formatRupiah(finance?.summary.totalRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Transfer / QRIS
            </p>
            <p className="mt-3 text-xl font-semibold">
              {formatRupiah(finance?.methods.transfer.amount)}
            </p>
            <p className="text-xs text-gray-400">
              {finance?.methods.transfer.count || 0} transaksi
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              COD
            </p>
            <p className="mt-3 text-xl font-semibold">
              {formatRupiah(finance?.methods.cod.amount)}
            </p>
            <p className="text-xs text-gray-400">
              {finance?.methods.cod.count || 0} transaksi
            </p>
          </div>
        </div>
      </section>

      {/* 📊 FINANCE CHART */}
      <section>
        <FinanceChart data={finance?.chart || []} />
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
       
       {/* 🔥 PRODUK TERLARIS */}
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

            <p className="font-semibold">
              {formatRupiah(p.totalRevenue)}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
</section>
    </div>
  );
}
