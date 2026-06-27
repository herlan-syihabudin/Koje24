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
  Tag,
  Settings,
  MessageSquare,
  LogOut,
  TrendingUp,
  Activity,
  Bell,
  PackageCheck,
  Clock,
  RotateCw,
  PlusCircle,
  Folder,
  Warehouse,
  Droplet,
  UserPlus,
  Star,
  Ban,
  Calendar,
  FileText,
  CreditCard,
  Receipt,
  AlertCircle,
  ShoppingCart,
  Ticket,
  Zap,
  Megaphone,
  BarChart,
  PieChart,
  Download,
  Shield,
  Database,
} from "lucide-react";

const NAV = [
  // ========================================
  // 1. DASHBOARD & ANALYTICS
  // ========================================
  {
    title: "📊 DASHBOARD",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
      { label: "Real-time Monitor", href: "/dashboard/monitor", icon: Activity },
    ],
  },

  // ========================================
  // 2. ORDER MANAGEMENT
  // ========================================
  {
    title: "📦 ORDER MANAGEMENT",
    items: [
      { label: "Semua Order", href: "/dashboard/orders", icon: ShoppingBag },
      { label: "Order Baru", href: "/dashboard/orders/new", icon: Bell },
      { label: "Proses & Kirim", href: "/dashboard/orders/process", icon: PackageCheck },
      { label: "Riwayat Order", href: "/dashboard/orders/history", icon: Clock },
      { label: "Retur & Cancel", href: "/dashboard/orders/returns", icon: RotateCw },
    ],
  },

  // ========================================
  // 3. PRODUCT MANAGEMENT
  // ========================================
  {
    title: "🧃 PRODUCT MANAGEMENT",
    items: [
      { label: "Daftar Produk", href: "/dashboard/products", icon: Package },
      { label: "Tambah Produk", href: "/dashboard/products/add", icon: PlusCircle },
      { label: "Kategori", href: "/dashboard/products/categories", icon: Folder },
      { label: "Stok & Inventory", href: "/dashboard/products/stock", icon: Warehouse },
      { label: "Harga & Promo", href: "/dashboard/products/pricing", icon: Tag },
      { label: "Bahan Baku", href: "/dashboard/products/ingredients", icon: Droplet },
    ],
  },

  // ========================================
  // 4. CUSTOMER MANAGEMENT
  // ========================================
  {
    title: "👥 CUSTOMER MANAGEMENT",
    items: [
      { label: "Semua Pelanggan", href: "/dashboard/customers", icon: Users },
      { label: "Pelanggan Baru", href: "/dashboard/customers/new", icon: UserPlus },
      { label: "Repeat Customer", href: "/dashboard/customers/repeat", icon: Star },
      { label: "Blacklist", href: "/dashboard/customers/blacklist", icon: Ban },
    ],
  },

  // ========================================
  // 5. FINANCE & ACCOUNTING
  // ========================================
  {
    title: "💰 FINANCE & ACCOUNTING",
    items: [
      { label: "Ringkasan Keuangan", href: "/dashboard/finance", icon: DollarSign },
      { label: "Pendapatan Harian", href: "/dashboard/finance/daily", icon: Calendar },
      { label: "Laporan Bulanan", href: "/dashboard/finance/monthly", icon: FileText },
      { label: "Pembayaran", href: "/dashboard/finance/payments", icon: CreditCard },
      { label: "Ongkir & Kurir", href: "/dashboard/finance/shipping", icon: Truck },
      { label: "Pajak & Laporan", href: "/dashboard/finance/tax", icon: Receipt },
    ],
  },

  // ========================================
  // 6. INVENTORY & SUPPLY
  // ========================================
  {
    title: "📦 INVENTORY & SUPPLY",
    items: [
      { label: "Stok Gudang", href: "/dashboard/inventory", icon: Warehouse },
      { label: "Stok Menipis", href: "/dashboard/inventory/low-stock", icon: AlertCircle },
      { label: "Pemasok", href: "/dashboard/inventory/suppliers", icon: Truck },
      { label: "Pembelian Stok", href: "/dashboard/inventory/purchases", icon: ShoppingCart },
    ],
  },

  // ========================================
  // 7. MARKETING & PROMOTION
  // ========================================
  {
    title: "📢 MARKETING",
    items: [
      { label: "Promo & Diskon", href: "/dashboard/promos", icon: Tag },
      { label: "Kode Voucher", href: "/dashboard/promos/vouchers", icon: Ticket },
      { label: "Flash Sale", href: "/dashboard/promos/flash-sale", icon: Zap },
      { label: "Testimoni", href: "/dashboard/testimonials", icon: MessageSquare },
      { label: "Campaign", href: "/dashboard/marketing/campaigns", icon: Megaphone },
    ],
  },

  // ========================================
  // 8. REPORTS & ANALYTICS
  // ========================================
  {
    title: "📈 REPORTS & ANALYTICS",
    items: [
      { label: "Laporan Penjualan", href: "/dashboard/reports/sales", icon: BarChart },
      { label: "Laporan Produk", href: "/dashboard/reports/products", icon: PieChart },
      { label: "Laporan Pelanggan", href: "/dashboard/reports/customers", icon: Users },
      { label: "Export Data", href: "/dashboard/reports/export", icon: Download },
    ],
  },

  // ========================================
  // 9. TEAM & STAFF
  // ========================================
  {
    title: "👨‍💼 TEAM MANAGEMENT",
    items: [
      { label: "Daftar Staff", href: "/dashboard/staff", icon: Users },
      { label: "Tambah Staff", href: "/dashboard/staff/add", icon: UserPlus },
      { label: "Role & Permission", href: "/dashboard/staff/roles", icon: Shield },
      { label: "Aktivitas Staff", href: "/dashboard/staff/activity", icon: Activity },
    ],
  },

  // ========================================
  // 10. SYSTEM SETTINGS
  // ========================================
  {
    title: "⚙️ SYSTEM SETTINGS",
    items: [
      { label: "Pengaturan Toko", href: "/dashboard/settings", icon: Settings },
      { label: "Pengiriman", href: "/dashboard/settings/shipping", icon: Truck },
      { label: "Pembayaran", href: "/dashboard/settings/payment", icon: CreditCard },
      { label: "Notifikasi", href: "/dashboard/settings/notifications", icon: Bell },
      { label: "Backup & Restore", href: "/dashboard/settings/backup", icon: Database },
      { label: "Log Aktivitas", href: "/dashboard/settings/logs", icon: FileText },
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

  // SIDEBAR CONTENT
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

  // DESKTOP
  if (!isMobile) {
    return (
      <aside className="w-64 bg-white border-r flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    );
  }

  // MOBILE
  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border md:hidden"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
