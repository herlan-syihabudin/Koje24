"use client";

import { useState } from "react";
import { Truck, MapPin, Package, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ShippingPage() {
  const [shippingCost, setShippingCost] = useState(15000);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Ongkir berhasil diupdate");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">SHIPPING</p>
        <h1 className="text-2xl font-semibold">Ongkir & Kurir</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola biaya pengiriman dan kurir.</p>
      </div>

      {/* Ongkir Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0FA3A8]" />
            <h2 className="text-lg font-semibold">Biaya Pengiriman</h2>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-[#0FA3A8] hover:underline text-sm">
              <Edit2 className="w-4 h-4 inline mr-1" /> Edit
            </button>
          ) : (
            <button onClick={handleSave} className="text-green-600 hover:underline text-sm">
              <Save className="w-4 h-4 inline mr-1" /> Simpan
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(Number(e.target.value))}
              className="border rounded-xl px-4 py-2 w-40"
            />
            <span className="text-gray-500">/ pengiriman</span>
          </div>
        ) : (
          <p className="text-2xl font-bold text-[#0FA3A8]">Rp {shippingCost.toLocaleString("id-ID")}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">*Biaya pengiriman standar untuk area Jabodetabek</p>
      </div>

      {/* Area Pengiriman */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#0FA3A8]" />
          <h2 className="text-lg font-semibold">Area Pengiriman</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Jakarta", "Bekasi", "Tangerang", "Depok", "Bogor"].map((area) => (
            <span key={area} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Kurir */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-[#0FA3A8]" />
          <h2 className="text-lg font-semibold">Mitra Kurir</h2>
        </div>
        <div className="grid gap-3">
          {[
            { name: "JNE", type: "Reguler", est: "2-3 hari" },
            { name: "J&T", type: "Express", est: "1-2 hari" },
            { name: "SiCepat", type: "Same Day", est: "1 hari" },
          ].map((kurir) => (
            <div key={kurir.name} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-semibold">{kurir.name}</p>
                <p className="text-xs text-gray-400">{kurir.type} • Estimasi {kurir.est}</p>
              </div>
              <span className="text-green-600 text-sm">Aktif</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
