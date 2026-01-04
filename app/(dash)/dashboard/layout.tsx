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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0B4B50] text-white transition-all duration-300 flex flex-col`}>
        {/* logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0FA3A8] rounded-lg flex items-center justify-center font-bold">K</div>
          {sidebarOpen && <span className="text-xl font-bold">KOJE ADMIN</span>}
        </div>

        {/* menu */}
        <nav className="flex-1 px-4 overflow-y-auto">
          {nav.map((section, i) => (
            <div key={i} className="mb-6">
              {sidebarOpen && <p className="text-[10px] text-white/40 mb-2 px-2">{section.title}</p>}
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-2 rounded-xl text-white/70 hover:bg-white/10">
                  <item.icon size={18} />
                  {sidebarOpen && item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* logout */}
        <div className="p-4 border-t border-white/10">
          <Link href="/api/dashboard/logout" className="flex items-center gap-3 text-red-300">
            <LogOut size={18} /> {sidebarOpen && "Logout"}
          </Link>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <LayoutDashboard size={20} />
          </button>

          <div className="flex items-center gap-4">
            <Search size={18} />
            <Bell size={18} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
