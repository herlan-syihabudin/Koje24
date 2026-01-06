"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SalesChart from "@/components/dash/SalesChart";

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
        {value === null || value === undefined ? "—" : value}
      </p>
      <p className="text-xs text-gray-400 mt-3">Belum ada data</p>
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
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-semibold text-gray-900">
          Ringkasan KOJE24
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Dashboard internal untuk memantau order, produk, dan operasional KOJE24
          secara terpusat.
        </p>
      </section>

      {/* KPI */}
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard title="Order Hari Ini" value={todayOrders} />
        <StatCard title="Total Order Bulan Ini" value={monthOrders} />
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(totalRevenue)}
        />
      </section>

      {/* 🔥 GRAFIK PENJUALAN */}
      <section>
        <SalesChart />
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

      {/* ORDER TERBARU + PRODUK TERLARIS */}
      <section className="grid gap-5 md:grid-cols-2">
        {/* ORDER TERBARU */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Order Terbaru
          </p>
          <p className="text-sm text-gray-500 mt-1">
            5 order terakhir (PAID)
          </p>

          <div className="mt-5 space-y-3">
            {latestOrders.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-2 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{o.nama}</p>
                  <p className="text-xs text-gray-500">
                    {o.produk} • {o.qty} pcs
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {formatRupiah(o.totalBayar)}
                  </p>
                  <p className="text-xs text-green-600">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUK TERLARIS */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Produk Terlaris
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Berdasarkan qty terjual (bulan ini)
          </p>

          <div className="mt-5 space-y-3">
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
        </div>
      </section>
    </div>
  );
}
