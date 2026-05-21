"use client";

import { useEffect, useState } from "react";
import { 
  Save, RefreshCw, DollarSign, Truck, Phone, Mail, MapPin, 
  Instagram, Facebook, Twitter, Globe, Settings as SettingsIcon,
  Building, CreditCard, Bell, Shield, FileText, Image, Palette,
  Code, Database, MessageSquare, Star, Clock, Users, Lock,
  Eye, EyeOff, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";

// ==================== TYPES ====================
type Settings = {
  // Toko
  store: {
    name: string;
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
  };
  // Pengiriman
  shipping: {
    cost: number;
    freeShippingMin: number;
    cities: string[];
    estimatedDays: string;
  };
  // Pembayaran
  payment: {
    methods: string[];
    banks: Array<{ name: string; accountNumber: string; owner: string }>;
    codFee: number;
    maxCodAmount: number;
  };
  // Kontak
  contact: {
    whatsapp: string;
    email: string;
    phone: string;
    address: string;
    mapEmbed: string;
  };
  // Sosial Media
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  // Promo Global
  promoGlobal: {
    active: boolean;
    type: "percent" | "flat";
    value: number;
    minSpend: number;
  };
  // Notifikasi
  notification: {
    orderEmail: boolean;
    orderWhatsapp: boolean;
    customerEmail: boolean;
    adminEmail: string;
  };
  // Keamanan
  security: {
    maintenanceMode: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    allowedIps: string[];
  };
  // Invoice
  invoice: {
    prefix: string;
    footer: string;
    showLogo: boolean;
  };
  // Integrasi
  integration: {
    googleAnalytics: string;
    metaPixel: string;
    googleSheetId: string;
  };
};

// ==================== DEFAULT SETTINGS ====================
const defaultSettings: Settings = {
  store: {
    name: "KOJE24",
    logo: "",
    favicon: "",
    primaryColor: "#0FA3A8",
    secondaryColor: "#E8C46B",
  },
  shipping: {
    cost: 15000,
    freeShippingMin: 200000,
    cities: ["Jakarta", "Bekasi", "Tangerang", "Depok", "Bogor"],
    estimatedDays: "1-3",
  },
  payment: {
    methods: ["COD", "Transfer Bank", "QRIS"],
    banks: [
      { name: "BCA", accountNumber: "1234567890", owner: "KOJE24" },
    ],
    codFee: 5000,
    maxCodAmount: 500000,
  },
  contact: {
    whatsapp: "6282213139580",
    email: "info@koje24.com",
    phone: "082213139580",
    address: "Bekasi, Indonesia",
    mapEmbed: "",
  },
  social: {
    instagram: "https://instagram.com/koje24",
    facebook: "",
    twitter: "",
    youtube: "",
    tiktok: "",
  },
  seo: {
    title: "KOJE24 - Cold Pressed Juice",
    description: "Cold-pressed juice alami tanpa gula tambahan. Detox, energi, dan imunitas.",
    keywords: "cold pressed juice, jus sehat, detox, jus alami",
    ogImage: "",
  },
  promoGlobal: {
    active: false,
    type: "percent",
    value: 10,
    minSpend: 50000,
  },
  notification: {
    orderEmail: true,
    orderWhatsapp: true,
    customerEmail: true,
    adminEmail: "admin@koje24.com",
  },
  security: {
    maintenanceMode: false,
    sessionTimeout: 60,
    twoFactorAuth: false,
    allowedIps: [],
  },
  invoice: {
    prefix: "INV",
    footer: "Terima kasih telah berbelanja di KOJE24",
    showLogo: true,
  },
  integration: {
    googleAnalytics: "",
    metaPixel: "",
    googleSheetId: "",
  },
};

// ==================== MAIN COMPONENT ====================
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("toko");
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ name: "", accountNumber: "", owner: "" });
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [showAddIp, setShowAddIp] = useState(false);
  const [newIp, setNewIp] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/settings");
      const data = await res.json();
      if (data.success) setSettings(data.settings);
      else setSettings(defaultSettings);
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

  const tabs = [
    { id: "toko", label: "Toko", icon: Building },
    { id: "pengiriman", label: "Pengiriman", icon: Truck },
    { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
    { id: "kontak", label: "Kontak", icon: Phone },
    { id: "sosial", label: "Sosial Media", icon: Instagram },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "promo", label: "Promo", icon: DollarSign },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
    { id: "keamanan", label: "Keamanan", icon: Shield },
    { id: "invoice", label: "Invoice", icon: FileText },
    { id: "integrasi", label: "Integrasi", icon: Code },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">SYSTEM</p>
          <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-600 mt-1">
            Konfigurasi lengkap toko, pengiriman, pembayaran, dan lainnya.
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
            Simpan Semua
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-[#0FA3A8] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {/* TAB 1: TOKO */}
        {activeTab === "toko" && (
          <>
            <SettingCard title="Informasi Toko" icon={Building}>
              <SettingInput
                label="Nama Toko"
                value={settings.store.name}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  store: { ...settings.store, name: val }
                })}
              />
              <SettingInput
                label="Logo URL"
                value={settings.store.logo}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  store: { ...settings.store, logo: val }
                })}
                placeholder="https://.../logo.png"
              />
              <SettingInput
                label="Favicon URL"
                value={settings.store.favicon}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  store: { ...settings.store, favicon: val }
                })}
                placeholder="https://.../favicon.ico"
              />
            </SettingCard>

            <SettingCard title="Warna Branding" icon={Palette}>
              <div className="grid grid-cols-2 gap-4">
                <SettingInput
                  label="Warna Utama"
                  value={settings.store.primaryColor}
                  onChange={(val) => setSettings({ 
                    ...settings, 
                    store: { ...settings.store, primaryColor: val }
                  })}
                  placeholder="#0FA3A8"
                />
                <SettingInput
                  label="Warna Sekunder"
                  value={settings.store.secondaryColor}
                  onChange={(val) => setSettings({ 
                    ...settings, 
                    store: { ...settings.store, secondaryColor: val }
                  })}
                  placeholder="#E8C46B"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: settings.store.primaryColor }} />
                  <span className="text-xs">Warna Utama</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: settings.store.secondaryColor }} />
                  <span className="text-xs">Warna Sekunder</span>
                </div>
              </div>
            </SettingCard>
          </>
        )}

        {/* TAB 2: PENGIRIMAN */}
        {activeTab === "pengiriman" && (
          <>
            <SettingCard title="Biaya & Wilayah" icon={Truck}>
              <SettingInput
                label="Biaya Ongkir (Rp)"
                value={settings.shipping.cost}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  shipping: { ...settings.shipping, cost: val }
                })}
                type="currency"
              />
              <SettingInput
                label="Gratis Ongkir Minimal Belanja (Rp)"
                value={settings.shipping.freeShippingMin}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  shipping: { ...settings.shipping, freeShippingMin: val }
                })}
                type="currency"
              />
              <SettingInput
                label="Estimasi Pengiriman (hari)"
                value={settings.shipping.estimatedDays}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  shipping: { ...settings.shipping, estimatedDays: val }
                })}
                placeholder="1-3"
              />
            </SettingCard>

            <SettingCard title="Kota Pengiriman" icon={MapPin}>
              <div className="flex flex-wrap gap-2 mb-3">
                {settings.shipping.cities.map((city, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {city}
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        shipping: {
                          ...settings.shipping,
                          cities: settings.shipping.cities.filter((_, i) => i !== idx)
                        }
                      })}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {showAddCity ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Nama kota"
                    className="flex-1 border rounded-xl px-4 py-2 text-sm"
                  />
                  <button
                    onClick={() => {
                      if (newCity.trim()) {
                        setSettings({
                          ...settings,
                          shipping: {
                            ...settings.shipping,
                            cities: [...settings.shipping.cities, newCity.trim()]
                          }
                        });
                        setNewCity("");
                        setShowAddCity(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#0FA3A8] text-white rounded-xl"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => setShowAddCity(false)}
                    className="px-4 py-2 bg-gray-200 rounded-xl"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCity(true)}
                  className="flex items-center gap-2 text-sm text-[#0FA3A8] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Tambah Kota
                </button>
              )}
            </SettingCard>
          </>
        )}

        {/* TAB 3: PEMBAYARAN */}
        {activeTab === "pembayaran" && (
          <>
            <SettingCard title="Metode Pembayaran" icon={CreditCard}>
              <div className="space-y-2">
                {["COD", "Transfer Bank", "QRIS"].map((method) => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.payment.methods.includes(method)}
                      onChange={(e) => {
                        const newMethods = e.target.checked
                          ? [...settings.payment.methods, method]
                          : settings.payment.methods.filter(m => m !== method);
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, methods: newMethods }
                        });
                      }}
                      className="w-4 h-4 text-[#0FA3A8]"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </SettingCard>

            <SettingCard title="Rekening Bank" icon={Building}>
              {settings.payment.banks.map((bank, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{bank.name}</p>
                      <p className="text-sm">{bank.accountNumber}</p>
                      <p className="text-xs text-gray-500">a.n {bank.owner}</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          banks: settings.payment.banks.filter((_, i) => i !== idx)
                        }
                      })}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {showAddBank ? (
                <div className="space-y-2 mt-3 p-3 border rounded-xl">
                  <input
                    type="text"
                    placeholder="Nama Bank"
                    value={newBank.name}
                    onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Atas Nama"
                    value={newBank.owner}
                    onChange={(e) => setNewBank({ ...newBank, owner: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newBank.name && newBank.accountNumber && newBank.owner) {
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              banks: [...settings.payment.banks, newBank]
                            }
                          });
                          setNewBank({ name: "", accountNumber: "", owner: "" });
                          setShowAddBank(false);
                        }
                      }}
                      className="px-4 py-2 bg-[#0FA3A8] text-white rounded-lg text-sm"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setShowAddBank(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddBank(true)}
                  className="flex items-center gap-2 text-sm text-[#0FA3A8] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Tambah Rekening
                </button>
              )}
            </SettingCard>

            <SettingCard title="Biaya COD" icon={DollarSign}>
              <SettingInput
                label="Biaya COD (Rp)"
                value={settings.payment.codFee}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  payment: { ...settings.payment, codFee: val }
                })}
                type="currency"
              />
              <SettingInput
                label="Maksimal Pembayaran COD (Rp)"
                value={settings.payment.maxCodAmount}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  payment: { ...settings.payment, maxCodAmount: val }
                })}
                type="currency"
              />
            </SettingCard>
          </>
        )}

        {/* TAB 4: KONTAK */}
        {activeTab === "kontak" && (
          <SettingCard title="Informasi Kontak" icon={Phone}>
            <SettingInput
              label="WhatsApp"
              value={settings.contact.whatsapp}
              onChange={(val) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: val } })}
              icon={<Phone className="w-4 h-4" />}
            />
            <SettingInput
              label="Email"
              value={settings.contact.email}
              onChange={(val) => setSettings({ ...settings, contact: { ...settings.contact, email: val } })}
              icon={<Mail className="w-4 h-4" />}
            />
            <SettingInput
              label="Telepon"
              value={settings.contact.phone}
              onChange={(val) => setSettings({ ...settings, contact: { ...settings.contact, phone: val } })}
              icon={<Phone className="w-4 h-4" />}
            />
            <SettingInput
              label="Alamat"
              value={settings.contact.address}
              onChange={(val) => setSettings({ ...settings, contact: { ...settings.contact, address: val } })}
              icon={<MapPin className="w-4 h-4" />}
              textarea
            />
            <SettingInput
              label="Google Maps Embed URL"
              value={settings.contact.mapEmbed}
              onChange={(val) => setSettings({ ...settings, contact: { ...settings.contact, mapEmbed: val } })}
              placeholder="https://www.google.com/maps/embed/..."
              textarea
            />
          </SettingCard>
        )}

        {/* TAB 5: SOSIAL MEDIA */}
        {activeTab === "sosial" && (
          <SettingCard title="Sosial Media" icon={Instagram}>
            <SettingInput
              label="Instagram"
              value={settings.social.instagram}
              onChange={(val) => setSettings({ ...settings, social: { ...settings.social, instagram: val } })}
              icon={<Instagram className="w-4 h-4" />}
            />
            <SettingInput
              label="Facebook"
              value={settings.social.facebook}
              onChange={(val) => setSettings({ ...settings, social: { ...settings.social, facebook: val } })}
              icon={<Facebook className="w-4 h-4" />}
            />
            <SettingInput
              label="Twitter"
              value={settings.social.twitter}
              onChange={(val) => setSettings({ ...settings, social: { ...settings.social, twitter: val } })}
              icon={<Twitter className="w-4 h-4" />}
            />
            <SettingInput
              label="YouTube"
              value={settings.social.youtube}
              onChange={(val) => setSettings({ ...settings, social: { ...settings.social, youtube: val } })}
              icon={<Globe className="w-4 h-4" />}
            />
            <SettingInput
              label="TikTok"
              value={settings.social.tiktok}
              onChange={(val) => setSettings({ ...settings, social: { ...settings.social, tiktok: val } })}
              icon={<Globe className="w-4 h-4" />}
            />
          </SettingCard>
        )}

        {/* TAB 6: SEO */}
        {activeTab === "seo" && (
          <SettingCard title="SEO & Metadata" icon={Globe}>
            <SettingInput
              label="Meta Title"
              value={settings.seo.title}
              onChange={(val) => setSettings({ ...settings, seo: { ...settings.seo, title: val } })}
            />
            <SettingInput
              label="Meta Description"
              value={settings.seo.description}
              onChange={(val) => setSettings({ ...settings, seo: { ...settings.seo, description: val } })}
              textarea
            />
            <SettingInput
              label="Meta Keywords"
              value={settings.seo.keywords}
              onChange={(val) => setSettings({ ...settings, seo: { ...settings.seo, keywords: val } })}
              placeholder="keyword1, keyword2, keyword3"
            />
            <SettingInput
              label="OG Image URL"
              value={settings.seo.ogImage}
              onChange={(val) => setSettings({ ...settings, seo: { ...settings.seo, ogImage: val } })}
              placeholder="https://.../og-image.jpg"
            />
          </SettingCard>
        )}

        {/* TAB 7: PROMO GLOBAL */}
        {activeTab === "promo" && (
          <SettingCard title="Promo Global (Otomatis)" icon={DollarSign}>
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
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={settings.promoGlobal.type === "percent"}
                      onChange={() => setSettings({
                        ...settings,
                        promoGlobal: { ...settings.promoGlobal, type: "percent" }
                      })}
                    />
                    <span className="text-sm">Persen (%)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={settings.promoGlobal.type === "flat"}
                      onChange={() => setSettings({
                        ...settings,
                        promoGlobal: { ...settings.promoGlobal, type: "flat" }
                      })}
                    />
                    <span className="text-sm">Potongan Langsung (Rp)</span>
                  </label>
                </div>
                <SettingInput
                  label={settings.promoGlobal.type === "percent" ? "Diskon (%)" : "Potongan (Rp)"}
                  value={settings.promoGlobal.value}
                  onChange={(val) => setSettings({ 
                    ...settings, 
                    promoGlobal: { ...settings.promoGlobal, value: val }
                  })}
                  type="number"
                  suffix={settings.promoGlobal.type === "percent" ? "%" : ""}
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
        )}

        {/* TAB 8: NOTIFIKASI */}
        {activeTab === "notifikasi" && (
          <SettingCard title="Pengaturan Notifikasi" icon={Bell}>
            <SettingToggle
              label="Email ke Admin saat Order Baru"
              value={settings.notification.orderEmail}
              onChange={(val) => setSettings({ 
                ...settings, 
                notification: { ...settings.notification, orderEmail: val }
              })}
            />
            <SettingToggle
              label="WhatsApp ke Admin saat Order Baru"
              value={settings.notification.orderWhatsapp}
              onChange={(val) => setSettings({ 
                ...settings, 
                notification: { ...settings.notification, orderWhatsapp: val }
              })}
            />
            <SettingToggle
              label="Email Konfirmasi ke Pelanggan"
              value={settings.notification.customerEmail}
              onChange={(val) => setSettings({ 
                ...settings, 
                notification: { ...settings.notification, customerEmail: val }
              })}
            />
            <SettingInput
              label="Email Admin (untuk notifikasi)"
              value={settings.notification.adminEmail}
              onChange={(val) => setSettings({ 
                ...settings, 
                notification: { ...settings.notification, adminEmail: val }
              })}
              icon={<Mail className="w-4 h-4" />}
            />
          </SettingCard>
        )}

        {/* TAB 9: KEAMANAN */}
        {activeTab === "keamanan" && (
          <>
            <SettingCard title="Mode Pemeliharaan" icon={Shield}>
              <SettingToggle
                label="Aktifkan Maintenance Mode"
                value={settings.security.maintenanceMode}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  security: { ...settings.security, maintenanceMode: val }
                })}
              />
              {settings.security.maintenanceMode && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Website akan menampilkan halaman maintenance untuk semua pengunjung.
                </p>
              )}
            </SettingCard>

            <SettingCard title="Session & Keamanan" icon={Lock}>
              <SettingInput
                label="Session Timeout (menit)"
                value={settings.security.sessionTimeout}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  security: { ...settings.security, sessionTimeout: val }
                })}
                type="number"
                suffix="menit"
              />
              <SettingToggle
                label="Two Factor Authentication"
                value={settings.security.twoFactorAuth}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  security: { ...settings.security, twoFactorAuth: val }
                })}
              />
            </SettingCard>

            <SettingCard title="IP Whitelist" icon={Eye}>
              <div className="flex flex-wrap gap-2 mb-3">
                {settings.security.allowedIps.map((ip, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-mono">
                    {ip}
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          allowedIps: settings.security.allowedIps.filter((_, i) => i !== idx)
                        }
                      })}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {showAddIp ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    placeholder="IP Address (contoh: 192.168.1.1)"
                    className="flex-1 border rounded-xl px-4 py-2 text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      if (newIp.trim()) {
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            allowedIps: [...settings.security.allowedIps, newIp.trim()]
                          }
                        });
                        setNewIp("");
                        setShowAddIp(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#0FA3A8] text-white rounded-xl"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => setShowAddIp(false)}
                    className="px-4 py-2 bg-gray-200 rounded-xl"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddIp(true)}
                  className="flex items-center gap-2 text-sm text-[#0FA3A8] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Tambah IP yang diizinkan
                </button>
              )}
              <p className="text-xs text-gray-400 mt-2">Kosongkan untuk mengizinkan semua IP</p>
            </SettingCard>
          </>
        )}

        {/* TAB 10: INVOICE */}
        {activeTab === "invoice" && (
          <SettingCard title="Pengaturan Invoice" icon={FileText}>
            <SettingInput
              label="Prefix Invoice"
              value={settings.invoice.prefix}
              onChange={(val) => setSettings({ 
                ...settings, 
                invoice: { ...settings.invoice, prefix: val }
              })}
              placeholder="INV"
            />
            <SettingInput
              label="Footer Invoice"
              value={settings.invoice.footer}
              onChange={(val) => setSettings({ 
                ...settings, 
                invoice: { ...settings.invoice, footer: val }
              })}
              textarea
            />
            <SettingToggle
              label="Tampilkan Logo di Invoice"
              value={settings.invoice.showLogo}
              onChange={(val) => setSettings({ 
                ...settings, 
                invoice: { ...settings.invoice, showLogo: val }
              })}
            />
          </SettingCard>
        )}

        {/* TAB 11: INTEGRASI */}
        {activeTab === "integrasi" && (
          <SettingCard title="Integrasi Pihak Ketiga" icon={Code}>
            <SettingInput
              label="Google Analytics ID"
              value={settings.integration.googleAnalytics}
              onChange={(val) => setSettings({ 
                ...settings, 
                integration: { ...settings.integration, googleAnalytics: val }
              })}
              placeholder="G-XXXXXXXXXX"
            />
            <SettingInput
              label="Meta Pixel ID"
              value={settings.integration.metaPixel}
              onChange={(val) => setSettings({ 
                ...settings, 
                integration: { ...settings.integration, metaPixel: val }
              })}
              placeholder="123456789012345"
            />
            <SettingInput
              label="Google Sheet ID"
              value={settings.integration.googleSheetId}
              onChange={(val) => setSettings({ 
                ...settings, 
                integration: { ...settings.integration, googleSheetId: val }
              })}
              placeholder="1abc123xyz..."
            />
          </SettingCard>
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================
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
  textarea = false,
  placeholder = ""
}: { 
  label: string; 
  value: string | number; 
  onChange: (val: any) => void; 
  type?: string;
  suffix?: string;
  icon?: React.ReactNode;
  textarea?: boolean;
  placeholder?: string;
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
            placeholder={placeholder}
            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${icon ? "pl-10" : ""}`}
          />
        ) : (
          <input
            type={type === "currency" ? "text" : type}
            value={type === "currency" ? displayValue : value}
            onChange={handleChange}
            placeholder={placeholder}
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
