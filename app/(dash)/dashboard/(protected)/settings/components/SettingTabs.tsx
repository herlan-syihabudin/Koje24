import { Building, Truck, CreditCard, Phone, Instagram, Globe, DollarSign, Bell, Shield, FileText, Code } from "lucide-react";

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

export default function SettingTabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === tab.id ? "bg-[#0FA3A8] text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
