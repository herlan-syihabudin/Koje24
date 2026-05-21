"use client";

import { useEffect, useState } from "react";
import { Tag, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Promo = {
  kode: string;
  tipe: string;
  nilai: number;
  minimal: number;
  maxDiskon: number | null;
  status: string;
  expired: string;
};

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promos");
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Gagal memuat data promo");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (kode: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
    setUpdating(kode);
    
    try {
      const res = await fetch("/api/dashboard/promos/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, status: newStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Promo ${newStatus === "aktif" ? "diaktifkan" : "dinonaktifkan"}`);
        loadPromos();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("Gagal mengubah status promo");
    } finally {
      setUpdating(null);
    }
  };

  const getTipeLabel = (tipe: string) => {
    switch (tipe) {
      case "percent": return "Diskon %";
      case "flat": return "Potongan Langsung";
      case "free_shipping": return "Gratis Ongkir";
      case "cashback": return "Cashback";
      default: return tipe;
    }
  };

  const getTipeIcon = (tipe: string) => {
    switch (tipe) {
      case "percent": return "🎯";
      case "flat": return "💰";
      case "free_shipping": return "🚚";
      case "cashback": return "💸";
      default: return "🏷️";
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">PROMOTIONS</p>
          <h1 className="text-2xl font-semibold">Manajemen Promo</h1>
          <p className="text-sm text-gray-600 mt-1">
            Aktifkan/nonaktifkan kode promo. Promo aktif akan muncul di website.
          </p>
        </div>
        <button
          onClick={loadPromos}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-green-50 p-5">
          <p className="text-xs text-green-600">Promo Aktif</p>
          <p className="text-2xl font-semibold text-green-700">
            {promos.filter(p => p.status === "aktif").length}
          </p>
        </div>
        <div className="rounded-2xl border bg-gray-50 p-5">
          <p className="text-xs text-gray-500">Total Promo</p>
          <p className="text-2xl font-semibold text-gray-700">{promos.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Kode</th>
                <th className="px-4 py-3 text-left">Tipe</th>
                <th className="px-4 py-3 text-left">Nilai</th>
                <th className="px-4 py-3 text-left">Min. Belanja</th>
                <th className="px-4 py-3 text-left">Max Diskon</th>
                <th className="px-4 py-3 text-left">Expired</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.kode} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTipeIcon(p.tipe)}</span>
                      <span className="font-mono font-semibold">{p.kode}</span>
                    </div>
                   </td>
                  <td className="px-4 py-3">{getTipeLabel(p.tipe)}</td>
                  <td className="px-4 py-3 font-semibold">
                    {p.tipe === "percent" 
                      ? `${p.nilai}%` 
                      : p.tipe === "free_shipping" 
                      ? "Gratis" 
                      : `Rp ${p.nilai.toLocaleString("id-ID")}`}
                  </td>
                  <td className="px-4 py-3">
                    {p.minimal > 0 ? `Rp ${p.minimal.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {p.maxDiskon ? `Rp ${p.maxDiskon.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {p.expired ? new Date(p.expired).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(p.kode, p.status)}
                      disabled={updating === p.kode}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        p.status === "aktif"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } disabled:opacity-50`}
                    >
                      {updating === p.kode ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : p.status === "aktif" ? (
                        "Aktif"
                      ) : (
                        "Nonaktif"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 Klik tombol status untuk mengaktifkan/menonaktifkan promo. 
          Promo dengan status <strong>Aktif</strong> akan langsung muncul di website.
        </p>
      </div>
    </div>
  );
}
