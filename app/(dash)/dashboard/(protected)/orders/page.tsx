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

/* 🔒 FLOW STATUS (INI KUNCI) */
const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["PAID"],
  PAID: ["DIPROSES"],
  DIPROSES: ["DIKIRIM"],
  DIKIRIM: ["SELESAI"],
  SELESAI: [],
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
  status: string;
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

  // ✅ pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [meta, setMeta] = useState<Meta | null>(null);

  /* =====================
     FETCH ORDERS
  ===================== */
  const fetchOrders = async (status: string, pageNum: number) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status && status !== "ALL") qs.set("status", status);
      qs.set("page", String(pageNum));
      qs.set("limit", String(limit));

      const url = `/api/dashboard/orders?${qs.toString()}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data?.success) {
        setOrders(data.orders || []);
        setMeta(data.meta || null);
        setPage(data?.meta?.page || pageNum);
      } else {
        setOrders([]);
        setMeta(null);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // reset page saat ganti tab
  useEffect(() => {
    setPage(1);
    fetchOrders(activeStatus, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  // fetch saat page berubah
  useEffect(() => {
    fetchOrders(activeStatus, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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

    // refresh page aktif
    fetchOrders(activeStatus, page);
  }

  const paginationText = useMemo(() => {
    if (!meta) return "";
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return `Menampilkan ${start}-${end} dari ${meta.total} order`;
  }, [meta]);

  const canPrev = meta ? meta.page > 1 : false;
  const canNext = meta ? meta.page < meta.totalPages : false;

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
          Update status pesanan sesuai alur operasional.
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
                ? "bg-[#0FA3A8] text-white"
                : "bg-white hover:bg-[#F7FBFB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PAGINATION BAR */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{paginationText}</p>

        <div className="flex items-center gap-2">
          <button
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 text-sm rounded-xl border bg-white disabled:opacity-50"
          >
            ← Prev
          </button>

          <div className="text-xs text-gray-600 px-3">
            Page <b>{meta?.page || page}</b> / {meta?.totalPages || 1}
          </div>

          <button
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 text-sm rounded-xl border bg-white disabled:opacity-50"
          >
            Next →
          </button>
        </div>
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
                    Rp {Number(o.totalBayar || 0).toLocaleString("id-ID")}
                  </td>

                  {/* STATUS */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          STATUS_STYLE[o.status] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {o.status}
                      </span>

                      <select
                        disabled={o.status === "SELESAI"}
                        value={o.status}
                        onChange={(e) => updateStatus(o.invoice, e.target.value)}
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
