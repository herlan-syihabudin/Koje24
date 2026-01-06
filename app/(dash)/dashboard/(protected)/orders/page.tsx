"use client";

import { useEffect, useState } from "react";

const STATUS_LIST = [
  "PENDING",
  "DIPROSES",
  "DIKIRIM",
  "SELESAI",
  "PAID",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard/orders", {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.success) setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateStatus(rowIndex: number, status: string) {
    await fetch("/api/dashboard/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex, status }),
    });

    fetchOrders(); // refresh data
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">ORDERS</p>
        <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
          Manajemen Order
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Kelola dan update status pesanan pelanggan.
        </p>
      </div>

      {/* TABLE */}
      <div className="border rounded-2xl bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Produk</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Belum ada order
                </td>
              </tr>
            )}

            {orders.map((o, i) => (
              <tr key={i} className="border-b">
                <td className="p-3 font-medium">{o.invoice}</td>
                <td className="p-3">{o.nama}</td>
                <td className="p-3">{o.produk}</td>
                <td className="p-3 text-center">{o.qty}</td>
                <td className="p-3 font-semibold">
                  Rp {o.totalBayar.toLocaleString("id-ID")}
                </td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) =>
                      updateStatus(o.rowIndex, e.target.value)
                    }
                    className="border rounded-lg px-2 py-1 text-xs"
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTE */}
      <div className="border rounded-2xl p-5 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan</p>
        <p className="text-sm text-gray-600 mt-1">
          Update status langsung tersimpan ke Google Sheet tanpa reload halaman.
        </p>
      </div>
    </div>
  );
}
