"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X,
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
      { label: "Proses Order", href: "/dashboard/orders?status=PENDING", icon: Clock }, // 🔥 TAMBAH
    ],
  },
  {
    title: "PRODUK",
    items: [
      { label: "Daftar Produk", href: "/dashboard/products", icon: Package },
      { label: "Stok & Inventory", href: "/dashboard/products/stock", icon: Package },
      { label: "Harga & Promo", href: "/dashboard/products/pricing", icon: Package },
      { label: "Kategori", href: "/dashboard/categories", icon: Tag }, // 🔥 TAMBAH
    ],
  },
  {
    title: "PELANGGAN",
    items: [
      { label: "Semua Pelanggan", href: "/dashboard/customers", icon: Users },
      { label: "Riwayat Order", href: "/dashboard/customers/orders", icon: History }, // 🔥 TAMBAH
    ],
  },
  {
    title: "KEUANGAN",
    items: [
      { label: "Ringkasan", href: "/dashboard/finance", icon: DollarSign },
      { label: "Pembayaran", href: "/dashboard/finance/payments", icon: DollarSign },
      { label: "Laporan", href: "/dashboard/finance/reports", icon: FileText }, // 🔥 TAMBAH
    ],
  },
  {
    title: "PENGATURAN",
    items: [
      { label: "Profile Toko", href: "/dashboard/settings", icon: Settings }, // 🔥 TAMBAH
      { label: "Pengguna", href: "/dashboard/users", icon: Users2 }, // 🔥 TAMBAH
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi layar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Tutup sidebar saat navigasi di mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Cegah scroll body saat sidebar mobile terbuka
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    if (confirm("Yakin mau logout?")) {
      await fetch("/api/dashboard/logout", { method: "POST" });
      window.location.href = "/dashboard/login";
    }
  };

  // ✅ SIDEBAR CONTENT (yang sama untuk desktop dan mobile)
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
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
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    
                    {isActive && (
                      <div className="w-1 h-5 rounded-full bg-[#0FA3A8]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="border-t p-3 space-y-2">
        <div className="px-3 py-2 text-[10px] text-gray-400">
          <p>KOJE24 Dashboard</p>
          <p>v1.0.0</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // ✅ DESKTOP: Sidebar tetap di samping
  if (!isMobile) {
    return (
      <aside className="w-64 bg-white border-r flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    );
  }

  // ✅ MOBILE: Hamburger menu + overlay
  return (
    <>
      {/* Tombol Hamburger */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border md:hidden"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Overlay gelap */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel Mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Tombol Close */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <SidebarContent />
      </div>
    </>
  );
}
