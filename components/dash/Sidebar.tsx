"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  Truck,
  LogOut 
} from "lucide-react";

const NAV = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "ORDER",
    items: [
      { label: "Semua Order", href: "/dashboard/orders", icon: ShoppingBag },
    ],
  },
  {
    title: "PRODUK",
    items: [
      { label: "Daftar Produk", href: "/dashboard/products", icon: Package },
      { label: "Stok & Inventory", href: "/dashboard/products/stock", icon: Package },
      { label: "Harga & Promo", href: "/dashboard/products/pricing", icon: Package },
    ],
  },
  {
    title: "PELANGGAN",
    items: [
      { label: "Pelanggan", href: "/dashboard/customers", icon: Users },
      { label: "Riwayat Order", href: "/dashboard/customers/orders", icon: Users },
    ],
  },
  {
    title: "KEUANGAN",
    items: [
      { label: "Ringkasan", href: "/dashboard/finance", icon: DollarSign },
      { label: "Pembayaran", href: "/dashboard/finance/payments", icon: DollarSign },
      { label: "Ongkir & Kurir", href: "/dashboard/finance/shipping", icon: Truck },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm("Yakin mau logout?")) {
      await fetch("/api/dashboard/logout", { method: "POST" });
      window.location.href = "/dashboard/login";
    }
  };

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 border-b">
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8] font-semibold">
          KOJE24
        </p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">Dashboard</h2>
        <p className="text-xs text-gray-400 mt-1">
          Panel operasional
        </p>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold text-gray-400 mb-2 px-2 tracking-wider">
              {section.title}
            </p>

            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-[#0FA3A8]/10 text-[#0FA3A8] font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="ml-auto w-1 h-5 rounded-full bg-[#0FA3A8]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* FOOTER - VERSI PREMIUM */}
      <div className="border-t p-3 space-y-2">
        <div className="px-3 py-2 text-xs text-gray-400">
          <p>UI: Stabil ✅</p>
          <p>Data: Aktif</p>
        </div>
        
        {/* Tombol Logout di Sidebar (opsional) */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
