"use client";

import { useEffect, useState } from "react";
import { Star, Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Testimonial = {
  id: string;
  nama: string;
  kota: string;
  pesan: string;
  rating: number;
  varian: string;
  img?: string;
  aktif: boolean;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/testimonials");
      const data = await res.json();
      if (data.success) setTestimonials(data.testimonials);
    } catch (error) {
      toast.error("Gagal memuat testimoni");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/dashboard/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aktif: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Testimoni ${!currentStatus ? "ditampilkan" : "disembunyikan"}`);
        loadTestimonials();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Gagal mengubah status");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const stats = {
    total: testimonials.length,
    aktif: testimonials.filter((t) => t.aktif).length,
    nonaktif: testimonials.filter((t) => !t.aktif).length,
    avgRating: testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length || 0,
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
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">TESTIMONIALS</p>
          <h1 className="text-2xl font-semibold">Manajemen Testimoni</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola testimoni pelanggan yang tampil di website.
          </p>
        </div>
        <button
          onClick={loadTestimonials}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Total Testimoni</p>
          <p className="text-2xl font-semibold mt-2">{stats.total}</p>
        </div>
        <div className="rounded-2xl border bg-green-50 p-5 shadow-sm">
          <p className="text-xs text-green-600">Ditampilkan</p>
          <p className="text-2xl font-semibold text-green-700 mt-2">{stats.aktif}</p>
        </div>
        <div className="rounded-2xl border bg-gray-50 p-5 shadow-sm">
          <p className="text-xs text-gray-500">Disembunyikan</p>
          <p className="text-2xl font-semibold text-gray-700 mt-2">{stats.nonaktif}</p>
        </div>
        <div className="rounded-2xl border bg-yellow-50 p-5 shadow-sm">
          <p className="text-xs text-yellow-600">Rata-rata Rating</p>
          <p className="text-2xl font-semibold text-yellow-700 mt-2">{stats.avgRating.toFixed(1)} ⭐</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Pelanggan</th>
                <th className="px-4 py-3 text-left">Testimoni</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{t.nama}</p>
                      <p className="text-xs text-gray-400">{t.kota}</p>
                    </div>
                   </td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-2">{t.pesan}</p>
                    <p className="text-xs text-gray-400 mt-1">Varian: {t.varian}</p>
                   </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= t.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                   </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        t.aktif
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                   </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(t.id, t.aktif)}
                      disabled={updating === t.id}
                      className={`p-2 rounded-lg transition ${
                        t.aktif
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      } disabled:opacity-50`}
                      title={t.aktif ? "Sembunyikan" : "Tampilkan"}
                    >
                      {updating === t.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : t.aktif ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>

        {testimonials.length === 0 && (
          <div className="p-8 text-center text-gray-400">Belum ada testimoni</div>
        )}
      </div>
    </div>
  );
}
