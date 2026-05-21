"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import SettingTabs from "./components/SettingTabs";
import StoreTab from "./tabs/StoreTab";
import ShippingTab from "./tabs/ShippingTab";
import PaymentTab from "./tabs/PaymentTab";
import ContactTab from "./tabs/ContactTab";
import SocialTab from "./tabs/SocialTab";
import SeoTab from "./tabs/SeoTab";
import PromoTab from "./tabs/PromoTab";
import NotificationTab from "./tabs/NotificationTab";
import SecurityTab from "./tabs/SecurityTab";
import InvoiceTab from "./tabs/InvoiceTab";
import IntegrationTab from "./tabs/IntegrationTab";

type Settings = {
  store: { name: string; logo: string; favicon: string; primaryColor: string; secondaryColor: string };
  shipping: { cost: number; freeShippingMin: number; cities: string[]; estimatedDays: string };
  payment: { methods: string[]; banks: Array<{ name: string; accountNumber: string; owner: string }>; codFee: number; maxCodAmount: number };
  contact: { whatsapp: string; email: string; phone: string; address: string; mapEmbed: string };
  social: { instagram: string; facebook: string; twitter: string; youtube: string; tiktok: string };
  seo: { title: string; description: string; keywords: string; ogImage: string };
  promoGlobal: { active: boolean; type: "percent" | "flat"; value: number; minSpend: number };
  notification: { orderEmail: boolean; orderWhatsapp: boolean; customerEmail: boolean; adminEmail: string };
  security: { maintenanceMode: boolean; sessionTimeout: number; twoFactorAuth: boolean; allowedIps: string[] };
  invoice: { prefix: string; footer: string; showLogo: boolean };
  integration: { googleAnalytics: string; metaPixel: string; googleSheetId: string };
};

const defaultSettings: Settings = {
  store: { name: "KOJE24", logo: "", favicon: "", primaryColor: "#0FA3A8", secondaryColor: "#E8C46B" },
  shipping: { cost: 15000, freeShippingMin: 200000, cities: ["Jakarta", "Bekasi", "Tangerang", "Depok", "Bogor"], estimatedDays: "1-3" },
  payment: { methods: ["COD", "Transfer Bank", "QRIS"], banks: [{ name: "BCA", accountNumber: "1234567890", owner: "KOJE24" }], codFee: 5000, maxCodAmount: 500000 },
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
  const [settings, setSettings] = useState<Settings | null>(null);
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
    setSettings((prev) => ({ ...prev!, [section]: { ...prev![section], ...value } }));
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

      {activeTab === "toko" && <StoreTab settings={settings.store} update={(val) => update("store", val)} />}
      {activeTab === "pengiriman" && <ShippingTab settings={settings.shipping} update={(val) => update("shipping", val)} />}
      {activeTab === "pembayaran" && <PaymentTab settings={settings.payment} update={(val) => update("payment", val)} />}
      {activeTab === "kontak" && <ContactTab settings={settings.contact} update={(val) => update("contact", val)} />}
      {activeTab === "sosial" && <SocialTab settings={settings.social} update={(val) => update("social", val)} />}
      {activeTab === "seo" && <SeoTab settings={settings.seo} update={(val) => update("seo", val)} />}
      {activeTab === "promo" && <PromoTab settings={settings.promoGlobal} update={(val) => update("promoGlobal", val)} />}
      {activeTab === "notifikasi" && <NotificationTab settings={settings.notification} update={(val) => update("notification", val)} />}
      {activeTab === "keamanan" && <SecurityTab settings={settings.security} update={(val) => update("security", val)} />}
      {activeTab === "invoice" && <InvoiceTab settings={settings.invoice} update={(val) => update("invoice", val)} />}
      {activeTab === "integrasi" && <IntegrationTab settings={settings.integration} update={(val) => update("integration", val)} />}
    </div>
  );
}
