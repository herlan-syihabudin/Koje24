"use client";

import { useEffect, useState } from "react";

/* =====================
   CONSTANT
===================== */
const STATUS_TABS = [
  { label: "Semua", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Diproses", value: "DIPROSES" },
  { label: "Dikirim", value: "DIKIRIM" },
  { label: "Selesai", value: "SELESAI" },
];

/* =====================
   PAGE
===================== */
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");

  /* =====================
     FETCH ORDERS
  ===================== */
  const fetchOrders = async (status: string) => {
    setLoading(true);

    try {
      const url =
        status === "ALL"
          ? "/api/dashboard/orders"
          : `/api/dashboard/orders?status=${status}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data?.success) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     LOAD ON STATUS CHANGE
  ===================== */
  useEffect(() => {
    fetchOrders(activeStatus);
  }, [activeStatus]);

  /* =====================
     UPDATE STATUS
  ===================== */
  async function updateStatus(rowIndex: number, status: string) {
    try {
      await fetch("/api/dashboard/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex, status }),
      });

      // 🔥 reload sesuai filter aktif
      fetchOrders(activeStatus);
    } catch (err) {
      console.error("Update status error:", err);
    }
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">ORDERS</p>
        <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
          Manajemen Order
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Filter & update status pesanan pelanggan.
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              activeStatus === tab.value
                ? "bg-[#0FA3A8] text-white border-[#0FA3A8]"
                : "bg-white hover:bg-[#F7FBFB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-2xl bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Produk</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Tidak ada order
                </td>
              </tr>
            )}

            {/* DATA */}
            {!loading &&
              orders.map((o, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3 font-medium">{o.invoice}</td>
                  <td className="p-3">{o.nama}</td>
                  <td className="p-3 max-w-md">{o.produk}</td>
                  <td className="p-3 text-center">{o.qty}</td>
                  <td className="p-3 text-right font-semibold">
                    Rp {o.totalBayar.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus(o.rowIndex, e.target.value)
                      }
                      className="border rounded-lg px-2 py-1 text-xs"
                    >
                      {STATUS_TABS.filter((s) => s.value !== "ALL").map(
                        (s) => (
                          <option key={s.value} value={s.value}>
                            {s.label.toUpperCase()}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* INFO */}
      <div className="border rounded-2xl p-5 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Status Filter Aktif</p>
        <p className="text-sm text-gray-600 mt-1">
          Menampilkan order dengan status:{" "}
          <strong>{activeStatus}</strong>
        </p>
      </div>
    </div>
  );
}
