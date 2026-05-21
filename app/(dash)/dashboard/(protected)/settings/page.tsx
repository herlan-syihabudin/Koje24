"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">SYSTEM</p>
          <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-600 mt-1">Konfigurasi lengkap toko online Anda.</p>
        </div>
        <button
          onClick={() => toast.success("Fitur sedang dalam pengembangan")}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#0FA3A8] text-white rounded-xl text-sm font-semibold hover:bg-[#0D8B8F] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </button>
      </div>

      <div className="bg-white border rounded-2xl p-6 text-center text-gray-500">
        🔧 Halaman pengaturan sedang dalam pengembangan.
        <br />
        Fitur akan segera hadir.
      </div>
    </div>
  );
}
