"use client";

import { useEffect, useState } from "react";

const STATUSES = ["ALL", "PENDING", "PAID", "DIKIRIM", "SELESAI"];

function formatRupiah(v: number) {
  return "Rp " + v.toLocaleString("id-ID");
}

export default function OrdersPage() {
  const [status, setStatus] = useState("ALL");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/orders?status=${status}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.orders);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Semua Order</h1>
        <p className="text-sm text-gray-500">
          Daftar seluruh transaksi KOJE24
        </p>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1 rounded-full text-xs border ${
              status === s
                ? "bg-[#0FA3A8] text-white"
                : "text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Produk</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Metode</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Tidak ada order
                </td>
              </tr>
            )}

            {orders.map((o, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{o.tanggal}</td>
                <td className="px-4 py-3 font-medium">{o.nama}</td>
                <td className="px-4 py-3">{o.produk}</td>
                <td className="px-4 py-3 text-right">{o.qty}</td>
                <td className="px-4 py-3 text-right">
                  {formatRupiah(o.totalBayar)}
                </td>
                <td className="px-4 py-3 text-center">{o.metode}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      o.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : o.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
