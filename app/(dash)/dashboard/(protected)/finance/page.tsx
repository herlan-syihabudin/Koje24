"use client";

import { useState, useEffect } from "react";
import FinanceChart from "@/components/dash/FinanceChart";

export default function FinancePage() {
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/finance")
      .then(res => res.json())
      .then(data => {
        if (data.success) setFinance(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 pb-8">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">FINANCE</p>
        <h1 className="text-2xl font-semibold">Keuangan KOJE24</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ringkasan pendapatan, pembayaran, dan invoice.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <FinanceStat 
          title="Total Pendapatan" 
          value={finance ? formatRupiah(finance.summary?.totalRevenue) : "—"}
        />
        <FinanceStat title="Pembayaran Masuk" value="—" />
        <FinanceStat title="Invoice Pending" value="—" />
        <FinanceStat title="Refund / Retur" value="—" />
      </div>

      {/* FINANCE CHART */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <FinanceChart 
          data={finance?.chart || []}
          loading={loading}
        />
      </div>

      {/* RIWAYAT PEMBAYARAN */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold">Riwayat Pembayaran</h2>
        </div>
        <div className="p-8 text-center text-gray-400">
          Data pembayaran akan muncul di sini
        </div>
      </div>
    </div>
  );
}

function FinanceStat({ title, value }: { title: string; value?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value ?? "—"}</p>
      <p className="text-xs text-gray-400 mt-1">Data realtime</p>
    </div>
  );
}

function formatRupiah(value?: number | null) {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "Rp 0";
  return "Rp " + value.toLocaleString("id-ID");
}
