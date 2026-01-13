"use client";

import { useEffect, useMemo, useState } from "react";

/* =====================
   TYPES
===================== */
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "COD"
  | "DIPROSES"
  | "DIKIRIM"
  | "SELESAI"
  | "CANCELLED";

type Order = {
  invoice: string;
  nama: string;
  produk: string;
  qty: number;
  totalBayar: number;
  status: OrderStatus;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/* =====================
   CONSTANT
===================== */
const STATUS_TABS = [
  { label: "Semua", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
  COD: "bg-orange-100 text-orange-700 border-orange-200",
  DIPROSES: "bg-blue-100 text-blue-700 border-blue-200",
  DIKIRIM: "bg-purple-100 text-purple-700 border-purple-200",
  SELESAI: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

/* urutan flow status → cegah downgrade */
const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "COD"],
  COD: ["DIPROSES"],
  PAID: ["DIPROSES"],
  DIPROSES: ["DIKIRIM"],
  DIKIRIM: ["SELESAI"],
  SELESAI: [],
  CANCELLED: [],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [updatingInvoice, setUpdatingInvoice] = useState<string | null>(null);

  /* pagination */
  const [page, setPage] = useState(1);
  const limit = 25;
  const [meta, setMeta] = useState<Meta | null>(null);

  /* =====================
     EXPORT & CLOSING
  ===================== */
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [closingStatus, setClosingStatus] =
    useState<"PAID" | "SELESAI">("PAID");
  const [exportLoading, setExportLoading] = useState(false);
  const [closingLoading, setClosingLoading] = useState(false);

  /* =====================
     FETCH ORDERS
  ===================== */
  async function fetchOrders(status: string, pageNum: number) {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status !== "ALL") qs.set("status", status);
      qs.set("page", String(pageNum));
      qs.set("limit", String(limit));

      const res = await fetch(`/api/dashboard/orders?${qs.toString()}`, {
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
  }

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
     UPDATE STATUS
  ===================== */
  async function updateStatus(invoice: string, status: OrderStatus) {
    if (!confirm(`Ubah status ${invoice} → ${status}?`)) return;

    setUpdatingInvoice(invoice);
    try {
      const res = await fetch("/api/invoice/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice, status }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Gagal update status");
        return;
      }

      await fetchOrders(activeStatus, page);
    } finally {
      setUpdatingInvoice(null);
    }
  }

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
    try {
      const res = await fetch("/api/dashboard/orders/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromDate,
          to: toDate,
          status: closingStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Gagal export");
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

      window.URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  /* =====================
     CLOSING
  ===================== */
  async function handleClosing() {
    if (
      !confirm(
        `CLOSING order ${closingStatus}\n${fromDate} → ${toDate}\n\nData akan dikunci. Lanjutkan?`
      )
    )
      return;

    setClosingLoading(true);
    try {
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
          ? `Closing berhasil (${data.closedCount ?? 0} order)`
          : data.message || "Gagal closing"
      );

      await fetchOrders(activeStatus, page);
    } finally {
      setClosingLoading(false);
    }
  }

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
          Update status, export & closing order
        </p>
      </div>

      {/* FILTER */}
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

      {/* EXPORT & CLOSING */}
      <div className="border rounded-2xl bg-white p-5 space-y-3">
        <p className="font-semibold">Export & Closing</p>

        <div className="grid md:grid-cols-5 gap-3">
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
            onChange={(e) => setClosingStatus(e.target.value as any)}
            className="border rounded-xl px-4 py-2 text-sm"
          >
            <option value="PAID">PAID</option>
            <option value="SELESAI">SELESAI</option>
          </select>

          <button
            onClick={handleClosing}
            disabled={closingLoading}
            className="bg-red-500 text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {closingLoading ? "Closing..." : "Closing Order"}
          </button>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="bg-[#0FA3A8] text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {exportLoading ? "Exporting..." : "Export Excel"}
          </button>
        </div>
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
              orders.map((o) => {
                const isUpdating = updatingInvoice === o.invoice;
                const nextOptions = [o.status, ...(STATUS_FLOW[o.status] || [])];

                return (
                  <tr
                    key={o.invoice}
                    className={`border-b transition ${
                      isUpdating ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <td className="p-3 font-medium">{o.invoice}</td>
                    <td className="p-3">{o.nama}</td>
                    <td className="p-3">{o.produk}</td>
                    <td className="p-3 text-center">{o.qty}</td>
                    <td className="p-3 text-right font-semibold">
                      Rp {Number(o.totalBayar || 0).toLocaleString("id-ID")}
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
                          value={o.status}
                          disabled={
                            isUpdating ||
                            o.status === "SELESAI" ||
                            o.status === "CANCELLED"
                          }
                          onChange={(e) =>
                            updateStatus(
                              o.invoice,
                              e.target.value as OrderStatus
                            )
                          }
                          className="border rounded-lg px-2 py-1 text-xs disabled:opacity-50"
                        >
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {isUpdating && (
                          <span className="text-[10px] text-gray-400 animate-pulse">
                            updating...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
