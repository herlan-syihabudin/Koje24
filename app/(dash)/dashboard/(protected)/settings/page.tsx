"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import SettingCard from "./components/SettingCard";
import SettingInput from "./components/SettingInput";
import SettingToggle from "./components/SettingToggle";
import SettingTabs from "./components/SettingTabs";

const defaultSettings = {
  store: { name: "KOJE24", logo: "", favicon: "", primaryColor: "#0FA3A8", secondaryColor: "#E8C46B" },
  shipping: { cost: 15000, freeShippingMin: 200000, cities: ["Jakarta", "Bekasi", "Tangerang", "Depok", "Bogor"], estimatedDays: "1-3" },
  payment: { methods: ["COD", "Transfer Bank", "QRIS"], banks: [], codFee: 5000, maxCodAmount: 500000 },
  contact: { whatsapp: "6282213139580", email: "info@koje24.com", phone: "082213139580", address: "Bekasi, Indonesia", mapEmbed: "" },
  social: { instagram: "https://instagram.com/koje24", facebook: "", twitter: "", youtube: "", tiktok: "" },
  seo: { title: "KOJE24 - Cold Pressed Juice", description: "Cold-pressed juice alami tanpa gula tambahan.", keywords: "cold pressed juice, jus sehat", ogImage: "" },
  promoGlobal: { active: false, type: "percent", value: 10, minSpend: 50000 },
  notification: { orderEmail: true, orderWhatsapp: true, customerEmail: true, adminEmail: "admin@koje24.com" },
  security: { maintenanceMode: false, sessionTimeout: 60, twoFactorAuth: false, allowedIps: [] },
  invoice: { prefix: "INV", footer: "Terima kasih telah berbelanja", showLogo: true },
  integration: { googleAnalytics: "", metaPixel: "", googleSheetId: "" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("toko");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/settings");
      const data = await res.json();
      setSettings(data.success ? data.settings : defaultSettings);
    } catch (error) {
      toast.error("Gagal memuat pengaturan");
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) toast.success("Pengaturan berhasil disimpan");
      else throw new Error();
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  if (loading) return <div className="flex justify-center h-64"><div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!settings) return null;

  const update = (section: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [section]: { ...prev[section], ...value } }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">SYSTEM</p>
          <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-600 mt-1">Konfigurasi lengkap toko online Anda.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSettings} className="p-2 rounded-lg hover:bg-gray-100"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
          <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0FA3A8] text-white rounded-xl text-sm font-semibold hover:bg-[#0D8B8F] disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Semua
          </button>
        </div>
      </div>

      <SettingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Store Tab */}
      {activeTab === "toko" && (
        <>
          <SettingCard title="Informasi Toko" icon={Building}>
            <SettingInput label="Nama Toko" value={settings.store.name} onChange={(val) => update("store", { name: val })} />
            <SettingInput label="Logo URL" value={settings.store.logo} onChange={(val) => update("store", { logo: val })} />
            <SettingInput label="Favicon URL" value={settings.store.favicon} onChange={(val) => update("store", { favicon: val })} />
          </SettingCard>
          <SettingCard title="Warna Branding" icon={Paintbrush}>
            <SettingInput label="Warna Utama" value={settings.store.primaryColor} onChange={(val) => update("store", { primaryColor: val })} />
            <SettingInput label="Warna Sekunder" value={settings.store.secondaryColor} onChange={(val) => update("store", { secondaryColor: val })} />
          </SettingCard>
        </>
      )}

      {/* Shipping Tab */}
      {activeTab === "pengiriman" && (
        <SettingCard title="Biaya Pengiriman" icon={Truck}>
          <SettingInput label="Ongkir (Rp)" value={settings.shipping.cost} onChange={(val) => update("shipping", { cost: val })} type="currency" />
          <SettingInput label="Gratis Ongkir Min (Rp)" value={settings.shipping.freeShippingMin} onChange={(val) => update("shipping", { freeShippingMin: val })} type="currency" />
        </SettingCard>
      )}

      {/* Contact Tab */}
      {activeTab === "kontak" && (
        <SettingCard title="Kontak" icon={Phone}>
          <SettingInput label="WhatsApp" value={settings.contact.whatsapp} onChange={(val) => update("contact", { whatsapp: val })} />
          <SettingInput label="Email" value={settings.contact.email} onChange={(val) => update("contact", { email: val })} />
          <SettingInput label="Alamat" value={settings.contact.address} onChange={(val) => update("contact", { address: val })} />
        </SettingCard>
      )}

      {/* Security Tab */}
      {activeTab === "keamanan" && (
        <>
          <SettingCard title="Mode Pemeliharaan" icon={Shield}>
            <SettingToggle label="Aktifkan Maintenance Mode" value={settings.security.maintenanceMode} onChange={(val) => update("security", { maintenanceMode: val })} />
          </SettingCard>
          <SettingCard title="Session" icon={Lock}>
            <SettingInput label="Session Timeout (menit)" value={settings.security.sessionTimeout} onChange={(val) => update("security", { sessionTimeout: val })} type="number" />
          </SettingCard>
        </>
      )}

      {/* Simple message for other tabs */}
      {!["toko", "pengiriman", "kontak", "keamanan"].includes(activeTab) && (
        <SettingCard title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} icon={Globe}>
          <p className="text-gray-500">Pengaturan untuk {activeTab} akan segera ditambahkan.</p>
        </SettingCard>
      )}
    </div>
  );
}
