"use client";

import { useEffect, useMemo, useState } from "react";

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

type Order = {
  invoice: string;
  nama: string;
  produk: string;
  qty: number;
  totalBayar: number;
  status: string;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/* =====================
   PAGE
===================== */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("ALL");

  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [meta, setMeta] = useState<Meta | null>(null);

  /* 🔐 CLOSING STATE */
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [closingStatus, setClosingStatus] = useState("PAID");
  const [closingLoading, setClosingLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  /* =====================
     FETCH ORDERS
  ===================== */
  const fetchOrders = async (status: string, pageNum: number) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status !== "ALL") qs.set("status", status);
      qs.set("page", String(pageNum));
      qs.set("limit", String(limit));

      const res = await fetch(`/api/dashboard/orders?${qs}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data?.success) {
        setOrders(data.orders || []);
        setMeta(data.meta || null);
        setPage(data.meta?.page || pageNum);
      } else {
        setOrders([]);
        setMeta(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrders(activeStatus, 1);
    // eslint-disable-next-line
  }, [activeStatus]);

  useEffect(() => {
    fetchOrders(activeStatus, page);
    // eslint-disable-next-line
  }, [page]);

  /* =====================
     EXPORT EXCEL
  ===================== */
  async function handleExport() {
    if (
      !confirm(
        `Export order ${closingStatus}\n${fromDate} → ${toDate}\n\nLanjutkan?`
      )
    )
      return;

    setExportLoading(true);

    const res = await fetch("/api/dashboard/orders/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: fromDate,
        endDate: toDate,
        status: closingStatus,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Gagal export");
      setExportLoading(false);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Closing_${closingStatus}_${fromDate}_${toDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setExportLoading(false);
  }

  /* =====================
     CLOSING ORDER
  ===================== */
  async function handleClosing() {
    if (
      !confirm(
        `CLOSING order ${closingStatus}\n${fromDate} → ${toDate}\n\nData akan dikunci. Lanjutkan?`
      )
    )
      return;

    setClosingLoading(true);

    const res = await fetch("/api/dashboard/orders/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromDate,
        to: toDate,
        status: closingStatus,
      }),
    });

    const data = await res.json();
    alert(
      data.success
        ? `Closing berhasil (${data.closedCount} order)`
        : data.message
    );

    setClosingLoading(false);
    fetchOrders(activeStatus, page);
  }

  /* =====================
     PAGINATION TEXT
  ===================== */
  const paginationText = useMemo(() => {
    if (!meta) return "";
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return `Menampilkan ${start}-${end} dari ${meta.total} order`;
  }, [meta]);

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">ORDERS</p>
        <h1 className="text-2xl md:text-3xl font-semibold">Manajemen Order</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update status & closing order harian / mingguan
        </p>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 rounded-full text-sm border ${
              activeStatus === tab.value
                ? "bg-[#0FA3A8] text-white"
                : "bg-white hover:bg-[#F7FBFB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔐 EXPORT & CLOSING */}
      <div className="border rounded-2xl bg-white p-6 space-y-4">
        <p className="font-semibold">Export & Closing Order</p>

        <div className="grid md:grid-cols-5 gap-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm"
          />
          <select
            value={closingStatus}
            onChange={(e) => setClosingStatus(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm"
          >
            <option value="PAID">PAID</option>
            <option value="SELESAI">SELESAI</option>
          </select>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="bg-[#0FA3A8] text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {exportLoading ? "Exporting..." : "Export Excel"}
          </button>

          <button
            onClick={handleClosing}
            disabled={closingLoading}
            className="bg-red-500 text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {closingLoading ? "Processing..." : "Closing Order"}
          </button>
        </div>

        <p className="text-xs text-yellow-600">
          ⚠️ Export dulu sebelum closing. Closing akan mengunci data.
        </p>
      </div>

      <p className="text-xs text-gray-500">{paginationText}</p>

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

            {!loading &&
              orders.map((o) => (
                <tr key={o.invoice} className="border-b">
                  <td className="p-3 font-medium">{o.invoice}</td>
                  <td className="p-3">{o.nama}</td>
                  <td className="p-3">{o.produk}</td>
                  <td className="p-3 text-center">{o.qty}</td>
                  <td className="p-3 text-right font-semibold">
                    Rp {o.totalBayar.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        STATUS_STYLE[o.status]
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
