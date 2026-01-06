"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      })
      .catch(() => {
        setTodayOrders(null);
        setMonthOrders(null);
        setTotalRevenue(null);
      });
  }, []);

  /* ORDER TERBARU */
  useEffect(() => {
    fetch("/api/dashboard/orders-latest", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setLatestOrders(data.orders);
        }
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

      {/* ORDER TERBARU */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Order Terbaru
          </p>
          <p className="text-sm text-gray-500 mt-1">
            5 order terakhir (PAID)
          </p>

          <div className="mt-5 space-y-3">
            {latestOrders.length === 0 && (
              <p className="text-xs text-gray-400">
                Belum ada order
              </p>
            )}

            {latestOrders.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-2 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {o.nama}
                  </p>
                  <p className="text-xs text-gray-500">
                    {o.produk} • {o.qty} pcs
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {formatRupiah(o.totalBayar)}
                  </p>
                  <p className="text-xs text-green-600">
                    {o.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUK TERLARIS (NEXT STEP) */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            Produk Terlaris
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Ranking produk terlaris berdasarkan penjualan
          </p>
          <div className="mt-5 h-28 rounded-xl border border-dashed bg-gray-50 flex items-center justify-center text-xs text-gray-400">
            Placeholder (Next Step)
          </div>
        </div>
      </section>

      {/* NOTE */}
      <section className="rounded-2xl border bg-[#F7FBFB] p-6">
        <p className="text-sm font-semibold text-gray-900">
          Catatan Sistem
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          KPI dan Order Terbaru sudah terhubung ke data Google Sheet
          dan hanya menghitung order berstatus PAID.
        </p>
      </section>
    </div>
  );
}
