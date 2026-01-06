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

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
  DIPROSES: "bg-blue-100 text-blue-700 border-blue-200",
  DIKIRIM: "bg-purple-100 text-purple-700 border-purple-200",
  SELESAI: "bg-gray-100 text-gray-700 border-gray-200",
};

/* 🔒 FLOW STATUS (TIDAK BISA LOMPAT) */
const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["PAID"],
  PAID: ["DIPROSES"],
  DIPROSES: ["DIKIRIM"],
  DIKIRIM: ["SELESAI"],
  SELESAI: [],
};

/* =====================
   PAGE
===================== */
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("ALL");

  /* EXPORT STATE */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportStatus, setExportStatus] = useState("PAID");

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
      setOrders(data?.success ? data.orders : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeStatus);
  }, [activeStatus]);

  /* =====================
     UPDATE STATUS
  ===================== */
  async function updateStatus(invoice: string, status: string) {
    if (!confirm(`Ubah status invoice ${invoice} menjadi ${status}?`)) return;

    const res = await fetch("/api/dashboard/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice, status }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Gagal update status");
      return;
    }

    fetchOrders(activeStatus);
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">ORDERS</p>
        <h1 className="text-2xl md:text-3xl font-semibold">
          Manajemen Order
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Update status & closing order harian / mingguan
        </p>
      </div>

      {/* FILTER STATUS */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              activeStatus === tab.value
                ? "bg-[#0FA3A8] text-white"
                : "bg-white hover:bg-[#F7FBFB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔥 EXPORT & CLOSING PANEL */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">
          Export & Closing Order
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Digunakan untuk closing laporan (harian / mingguan)
        </p>

        <div className="grid md:grid-cols-4 gap-4 mt-5">
          <div>
            <label className="text-xs text-gray-500">Dari Tanggal</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Sampai Tanggal</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value)}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
            >
              <option value="PAID">Paid</option>
              <option value="ALL">Semua</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              disabled={!fromDate || !toDate}
              className="w-full px-4 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm font-semibold disabled:cursor-not-allowed"
            >
              Export Excel
            </button>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-3">
          ⚠️ Setelah closing, data aman untuk arsip & laporan keuangan
        </p>
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
                  Tidak ada order
                </td>
              </tr>
            )}

            {!loading &&
              orders.map((o) => (
                <tr key={o.invoice} className="border-b last:border-0">
                  <td className="p-3 font-medium">{o.invoice}</td>
                  <td className="p-3">{o.nama}</td>
                  <td className="p-3">{o.produk}</td>
                  <td className="p-3 text-center">{o.qty}</td>
                  <td className="p-3 text-right font-semibold">
                    Rp {o.totalBayar.toLocaleString("id-ID")}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          STATUS_STYLE[o.status]
                        }`}
                      >
                        {o.status}
                      </span>

                      <select
                        disabled={o.status === "SELESAI"}
                        value={o.status}
                        onChange={(e) =>
                          updateStatus(o.invoice, e.target.value)
                        }
                        className="border rounded-lg px-2 py-1 text-xs disabled:opacity-50"
                      >
                        <option value={o.status}>{o.status}</option>
                        {(STATUS_FLOW[o.status] || []).map((next) => (
                          <option key={next} value={next}>
                            {next}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
