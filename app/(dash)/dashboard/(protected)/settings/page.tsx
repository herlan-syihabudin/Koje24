"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, DollarSign, Truck, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Globe, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

type Settings = {
  shippingCost: number;
  minOrder: number;
  maintenanceMode: boolean;
  contact: {
    whatsapp: string;
    email: string;
    address: string;
  };
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  seo: {
    title: string;
    description: string;
  };
  promoGlobal: {
    active: boolean;
    discountPercent: number;
    minSpend: number;
  };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/settings");
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (error) {
      toast.error("Gagal memuat pengaturan");
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
      if (data.success) {
        toast.success("Pengaturan berhasil disimpan");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">SYSTEM</p>
          <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-600 mt-1">
            Konfigurasi akses, pembayaran, pengiriman, dan keamanan.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSettings}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#0FA3A8] text-white rounded-xl text-sm font-semibold hover:bg-[#0D8B8F] transition disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* PENGIRIMAN & PEMBAYARAN */}
      <div className="grid md:grid-cols-2 gap-6">
        <SettingCard title="Pengiriman" icon={Truck}>
          <SettingInput
            label="Biaya Ongkir"
            value={settings.shippingCost}
            onChange={(val) => setSettings({ ...settings, shippingCost: val })}
            type="currency"
          />
          <SettingInput
            label="Minimal Order (Rp)"
            value={settings.minOrder}
            onChange={(val) => setSettings({ ...settings, minOrder: val })}
            type="currency"
          />
        </SettingCard>

        <SettingCard title="Promo Global" icon={DollarSign}>
          <SettingToggle
            label="Aktifkan Promo Global"
            value={settings.promoGlobal.active}
            onChange={(val) => setSettings({ 
              ...settings, 
              promoGlobal: { ...settings.promoGlobal, active: val }
            })}
          />
          {settings.promoGlobal.active && (
            <>
              <SettingInput
                label="Diskon (%)"
                value={settings.promoGlobal.discountPercent}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  promoGlobal: { ...settings.promoGlobal, discountPercent: val }
                })}
                type="number"
                suffix="%"
              />
              <SettingInput
                label="Minimal Belanja (Rp)"
                value={settings.promoGlobal.minSpend}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  promoGlobal: { ...settings.promoGlobal, minSpend: val }
                })}
                type="currency"
              />
            </>
          )}
        </SettingCard>
      </div>

      {/* KONTAK & SOSIAL MEDIA */}
      <div className="grid md:grid-cols-2 gap-6">
        <SettingCard title="Kontak" icon={Phone}>
          <SettingInput
            label="WhatsApp"
            value={settings.contact.whatsapp}
            onChange={(val) => setSettings({ 
              ...settings, 
              contact: { ...settings.contact, whatsapp: val }
            })}
            icon={<Phone className="w-4 h-4" />}
          />
          <SettingInput
            label="Email"
            value={settings.contact.email}
            onChange={(val) => setSettings({ 
              ...settings, 
              contact: { ...settings.contact, email: val }
            })}
            icon={<Mail className="w-4 h-4" />}
          />
          <SettingInput
            label="Alamat"
            value={settings.contact.address}
            onChange={(val) => setSettings({ 
              ...settings, 
              contact: { ...settings.contact, address: val }
            })}
            icon={<MapPin className="w-4 h-4" />}
          />
        </SettingCard>

        <SettingCard title="Sosial Media" icon={Instagram}>
          <SettingInput
            label="Instagram"
            value={settings.social.instagram}
            onChange={(val) => setSettings({ 
              ...settings, 
              social: { ...settings.social, instagram: val }
            })}
            icon={<Instagram className="w-4 h-4" />}
          />
          <SettingInput
            label="Facebook"
            value={settings.social.facebook}
            onChange={(val) => setSettings({ 
              ...settings, 
              social: { ...settings.social, facebook: val }
            })}
            icon={<Facebook className="w-4 h-4" />}
          />
          <SettingInput
            label="Twitter"
            value={settings.social.twitter}
            onChange={(val) => setSettings({ 
              ...settings, 
              social: { ...settings.social, twitter: val }
            })}
            icon={<Twitter className="w-4 h-4" />}
          />
        </SettingCard>
      </div>

      {/* SEO */}
      <SettingCard title="SEO & Metadata" icon={Globe}>
        <SettingInput
          label="Meta Title"
          value={settings.seo.title}
          onChange={(val) => setSettings({ 
            ...settings, 
            seo: { ...settings.seo, title: val }
          })}
        />
        <SettingInput
          label="Meta Description"
          value={settings.seo.description}
          onChange={(val) => setSettings({ 
            ...settings, 
            seo: { ...settings.seo, description: val }
          })}
          textarea
        />
      </SettingCard>

      {/* MAINTENANCE MODE */}
      <SettingCard title="Mode Pemeliharaan" icon={SettingsIcon}>
        <SettingToggle
          label="Aktifkan Maintenance Mode"
          value={settings.maintenanceMode}
          onChange={(val) => setSettings({ ...settings, maintenanceMode: val })}
        />
        {settings.maintenanceMode && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Website akan menampilkan halaman maintenance untuk semua pengunjung.
          </p>
        )}
      </SettingCard>
    </div>
  );
}

// COMPONENTS
function SettingCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#0FA3A8]" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function SettingInput({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  suffix,
  icon,
  textarea = false
}: { 
  label: string; 
  value: string | number; 
  onChange: (val: any) => void; 
  type?: string;
  suffix?: string;
  icon?: React.ReactNode;
  textarea?: boolean;
}) {
  const displayValue = type === "currency" && typeof value === "number" 
    ? value.toLocaleString("id-ID") 
    : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val: any = e.target.value;
    if (type === "number") val = Number(val);
    if (type === "currency") val = Number(val.replace(/\D/g, ""));
    onChange(val);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        {textarea ? (
          <textarea
            value={value}
            onChange={handleChange}
            rows={2}
            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${icon ? "pl-10" : ""}`}
          />
        ) : (
          <input
            type={type === "currency" ? "text" : type}
            value={type === "currency" ? displayValue : value}
            onChange={handleChange}
            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${icon ? "pl-10" : ""}`}
          />
        )}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition ${value ? "bg-[#0FA3A8]" : "bg-gray-300"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${value ? "right-1" : "left-1"}`} />
      </button>
    </div>
  );
}
