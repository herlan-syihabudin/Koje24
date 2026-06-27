"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  ShoppingCart,
  Tag,
  DollarSign
} from "lucide-react";

interface Settings {
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
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [settings, setSettings] = useState<Settings>({
    shippingCost: 15000,
    minOrder: 0,
    maintenanceMode: false,
    contact: {
      whatsapp: "",
      email: "",
      address: "",
    },
    social: {
      instagram: "",
      facebook: "",
      twitter: "",
    },
    seo: {
      title: "",
      description: "",
    },
    promoGlobal: {
      active: false,
      discountPercent: 0,
      minSpend: 0,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/dashboard/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save settings" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const update = (path: string[], value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current: any = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0FA3A8] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0FA3A8]/10 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-[#0FA3A8]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Settings</h1>
              <p className="text-sm text-gray-500">Kelola konfigurasi toko</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#0FA3A8] hover:bg-[#0D8B8F] text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Section: Pengiriman & Order */}
          <Section 
            icon={<ShoppingCart className="w-5 h-5 text-[#0FA3A8]" />}
            title="Pengiriman & Order"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ongkir Default
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">Rp</span>
                  <input
                    type="number"
                    value={settings.shippingCost}
                    onChange={(e) => update(["shippingCost"], Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Order (Rp)
                </label>
                <input
                  type="number"
                  value={settings.minOrder}
                  onChange={(e) => update(["minOrder"], Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => update(["maintenanceMode"], e.target.checked)}
                  className="w-4 h-4 text-[#0FA3A8] rounded focus:ring-[#0FA3A8]"
                />
                <span className="text-sm text-gray-700">Maintenance Mode</span>
              </label>
            </div>
          </Section>

          {/* Section: Kontak */}
          <Section 
            icon={<Mail className="w-5 h-5 text-[#0FA3A8]" />}
            title="Kontak"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" /> WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.contact.whatsapp}
                  onChange={(e) => update(["contact", "whatsapp"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="628123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={settings.contact.email}
                  onChange={(e) => update(["contact", "email"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="info@koje24.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" /> Alamat
                </label>
                <input
                  type="text"
                  value={settings.contact.address}
                  onChange={(e) => update(["contact", "address"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="Alamat toko"
                />
              </div>
            </div>
          </Section>

          {/* Section: Social Media */}
          <Section 
            icon={<Instagram className="w-5 h-5 text-[#0FA3A8]" />}
            title="Social Media"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Instagram className="w-4 h-4 inline mr-1" /> Instagram
                </label>
                <input
                  type="text"
                  value={settings.social.instagram}
                  onChange={(e) => update(["social", "instagram"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="https://instagram.com/koje24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Facebook className="w-4 h-4 inline mr-1" /> Facebook
                </label>
                <input
                  type="text"
                  value={settings.social.facebook}
                  onChange={(e) => update(["social", "facebook"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="https://facebook.com/koje24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Twitter className="w-4 h-4 inline mr-1" /> Twitter / X
                </label>
                <input
                  type="text"
                  value={settings.social.twitter}
                  onChange={(e) => update(["social", "twitter"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="https://twitter.com/koje24"
                />
              </div>
            </div>
          </Section>

          {/* Section: SEO */}
          <Section 
            icon={<Globe className="w-5 h-5 text-[#0FA3A8]" />}
            title="SEO"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={settings.seo.title}
                  onChange={(e) => update(["seo", "title"], e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                  placeholder="KOJE24 - Cold Pressed Juice Bekasi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={settings.seo.description}
                  onChange={(e) => update(["seo", "description"], e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent resize-none"
                  placeholder="Cold pressed juice premium di Bekasi..."
                />
              </div>
            </div>
          </Section>

          {/* Section: Promo Global */}
          <Section 
            icon={<Tag className="w-5 h-5 text-[#0FA3A8]" />}
            title="Promo Global"
          >
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promoGlobal.active}
                  onChange={(e) => update(["promoGlobal", "active"], e.target.checked)}
                  className="w-4 h-4 text-[#0FA3A8] rounded focus:ring-[#0FA3A8]"
                />
                <span className="text-sm text-gray-700">Aktifkan Promo Global</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" /> Diskon (%)
                  </label>
                  <input
                    type="number"
                    value={settings.promoGlobal.discountPercent}
                    onChange={(e) => update(["promoGlobal", "discountPercent"], Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    value={settings.promoGlobal.minSpend}
                    onChange={(e) => update(["promoGlobal", "minSpend"], Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#0FA3A8] focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ 
  icon, 
  title, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="border-b last:border-b-0 pb-6 last:pb-0">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
