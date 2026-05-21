"use client";

import { useEffect, useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  aktif: string;
};

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
    setLoading(false);
  };

  const updatePrice = async (id: string, newPrice: number) => {
    try {
      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ harga: newPrice }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      toast.success("Harga berhasil diupdate");
      loadProducts();
    } catch (error) {
      toast.error("Gagal update harga");
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.harga);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const saveEdit = (id: string) => {
    if (editValue <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }
    updatePrice(id, editValue);
    setEditingId(null);
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
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">PRICING</p>
        <h1 className="text-2xl font-semibold">Harga & Promo</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola harga produk dan promo.</p>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="text-center">Harga Saat Ini</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="text-center">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-32 px-2 py-1 border rounded text-center"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold">Rp {p.harga.toLocaleString("id-ID")}</span>
                    )}
                  </td>
                  <td className="text-center">
                    {editingId === p.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => saveEdit(p.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="p-1 text-[#0FA3A8] hover:bg-[#F7FBFB] rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
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
          💡 Tips: Klik ikon pensil untuk mengubah harga produk. Perubahan akan langsung berlaku di website.
        </p>
      </div>
    </div>
  );
}
