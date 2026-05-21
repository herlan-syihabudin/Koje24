"use client";

import { useEffect, useState } from "react";
import { CreditCard, Banknote, QrCode } from "lucide-react";

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch payments data
    fetch("/api/dashboard/finance")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.chart || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">PAYMENTS</p>
        <h1 className="text-2xl font-semibold">Metode Pembayaran</h1>
        <p className="text-sm text-gray-600 mt-1">Rekap pembayaran berdasarkan metode.</p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {payments.map((p, i) => {
          const icons = [CreditCard, Banknote, QrCode];
          const Icon = icons[i % icons.length];
          const colors = ["#0FA3A8", "#F59E0B", "#6366F1"];
          return (
            <div key={p.name} className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderTopColor: colors[i], borderTopWidth: 4 }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{p.name}</p>
                <Icon className="w-5 h-5" style={{ color: colors[i] }} />
              </div>
              <p className="text-2xl font-bold mt-2">Rp {p.value.toLocaleString("id-ID")}</p>
              <p className="text-xs text-gray-400 mt-1">Total transaksi</p>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-gray-50 border rounded-2xl p-6 text-center">
        <p className="text-gray-500">📊 Data pembayaran diambil dari transaksi dengan status PAID</p>
      </div>
    </div>
  );
}
