"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Truck,
  CreditCard,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";

export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const nav = [
    { title: "OVERVIEW", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
    {
      title: "ORDERS",
      items: [
        { href: "/dashboard/orders", label: "Semua Order", icon: ShoppingCart },
        { href: "/dashboard/orders/pending", label: "Pending", icon: Package },
        { href: "/dashboard/orders/paid", label: "Paid", icon: ShieldCheck },
        { href: "/dashboard/orders/shipped", label: "Dikirim", icon: Truck },
        { href: "/dashboard/orders/finished", label: "Selesai", icon: PackageCheck },
      ],
    },
    {
      title: "PRODUCTS",
      items: [
        { href: "/dashboard/products", label: "Produk", icon: Package },
        { href: "/dashboard/products/stock", label: "Stok", icon: BarChart3 },
        { href: "/dashboard/products/price", label: "Harga", icon: CreditCard },
      ],
    },
    {
      title: "CUSTOMER",
      items: [
        { href: "/dashboard/customers", label: "Pelanggan", icon: Users },
        { href: "/dashboard/customers/orders", label: "Riwayat Order", icon: ShoppingCart },
      ],
    },
    {
      title: "REPORTS",
      items: [
        { href: "/dashboard/reports/daily", label: "Laporan Harian", icon: BarChart3 },
        { href: "/dashboard/reports/monthly", label: "Laporan Bulanan", icon: BarChart3 },
        { href: "/dashboard/reports/export", label: "Export CSV", icon: BarChart3 },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { href: "/dashboard/system/payment", label: "Metode Pembayaran", icon: CreditCard },
        { href: "/dashboard/system/shipping", label: "Ongkir & Kurir", icon: Truck },
        { href: "/dashboard/system/admins", label: "Admin & Akses", icon: ShieldCheck },
        { href: "/dashboard/system/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0B4B50] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0FA3A8] rounded-lg flex items-center justify-center font-bold">K</div>
          {sidebarOpen && <span className="text-xl font-bold tracking-tight">KOJE ADMIN</span>}
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          {nav.map((section, idx) => (
            <div key={idx} className="mb-6">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-white/40 mb-2 px-2 tracking-widest">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="w-full flex items-center gap-3 p-2 rounded-xl transition-all text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/api/dashboard/logout"
            className="w-full flex items-center gap-3 p-2 text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <LayoutDashboard size={20} />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg gap-2 text-gray-400">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari order, produk..."
                className="bg-transparent outline-none text-sm text-gray-600 w-48"
              />
            </div>

            <div className="relative">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">{children}</div>
      </main>
    </div>
  );
}
