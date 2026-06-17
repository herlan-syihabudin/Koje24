"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";

type Order = {
  invoice: string;
  nama: string;
  produk: string;
  qty: number;
  totalBayar: number;
  status: string;
};

export default function ProcessOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/orders?status=PAID")
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0FA3A8] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.href = "/dashboard/orders"}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">ORDERS</p>
          <h1 className="text-2xl md:text-3xl font-semibold">Proses & Kirim</h1>
          <p className="text-sm text-gray-600 mt-1">
            Order yang sudah PAID siap diproses ({orders.length} order)
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <PackageCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600">Tidak ada order yang perlu diproses</h2>
          <p className="text-sm text-gray-400 mt-2">Semua order sudah dalam proses atau selesai</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">Produk</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.invoice} className="border-b">
                  <td className="p-3 font-medium">{order.invoice}</td>
                  <td className="p-3">{order.nama}</td>
                  <td className="p-3">{order.produk}</td>
                  <td className="p-3 text-right font-semibold">
                    Rp {order.totalBayar.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
