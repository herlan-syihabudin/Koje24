"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="bg-white rounded-2xl border p-6 text-center py-20">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Tambah Order Manual</h2>
        <p className="text-gray-400 mt-2">
          Fitur ini untuk membuat order baru secara manual.
        </p>
        <p className="text-sm text-gray-300 mt-4">
          🚀 Fitur dalam pengembangan
        </p>
      </div>
    </div>
  );
}
