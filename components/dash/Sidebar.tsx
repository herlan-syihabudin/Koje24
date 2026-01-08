"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const NAV = [
  {
    title: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    title: "ORDER",
    items: [{ label: "Semua Order", href: "/dashboard/orders" }],
  },
  {
    title: "PRODUK",
    items: [
      { label: "Daftar Produk", href: "/dashboard/products" },
      { label: "Stok & Inventory", href: "/dashboard/products/stock" },
      { label: "Harga & Promo", href: "/dashboard/products/pricing" },
    ],
  },
  {
    title: "PELANGGAN",
    items: [
      { label: "Pelanggan", href: "/dashboard/customers" },
      { label: "Riwayat Order", href: "/dashboard/customers/orders" },
    ],
  },
  {
    title: "KEUANGAN",
    items: [
      { label: "Ringkasan", href: "/dashboard/finance" },
      { label: "Pembayaran", href: "/dashboard/finance/payments" },
      { label: "Ongkir & Kurir", href: "/dashboard/finance/shipping" },
      { label: "Invoice", href: "/dashboard/finance/invoices" },
    ],
  },
  {
    title: "PENGATURAN",
    items: [
      { label: "Metode Pembayaran", href: "/dashboard/settings/payment" },
      { label: "Pengiriman", href: "/dashboard/settings/shipping" },
      { label: "Admin & Akses", href: "/dashboard/settings/admin" },
      { label: "System Status", href: "/dashboard/settings/system" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    if (!confirm("Yakin mau logout?")) return;

    await fetch("/api/dashboard/logout", { method: "POST" });

    // 🔥 FULL reload biar cookie benar-benar ilang
    window.location.href = "/dashboard/login";
  };

  return (
    <aside className="p-5 space-y-6 h-full flex flex-col">
      {/* HEADER + LOGOUT */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24</p>
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">
            Internal panel operasional
          </p>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={logout}
          title="Logout"
          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto pr-1">
        {NAV.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="text-[10px] font-semibold text-gray-400 mb-2 tracking-widest">
              {section.title}
            </p>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-3 py-2 text-sm transition ${
                      active
                        ? "bg-[#F7FBFB] font-semibold border"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* FOOTER STATUS */}
      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500">Status Sistem</p>
        <p className="text-sm font-medium mt-1">UI: Stabil ✅</p>
        <p className="text-xs text-gray-500">Data: Aktif (Orders)</p>
      </div>
    </aside>
  );
}
