"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Order", href: "/dashboard/orders" },
  { label: "Produk", href: "/dashboard/products" },
  { label: "Pelanggan", href: "/dashboard/customers" },
  { label: "Keuangan", href: "/dashboard/finance" },
  { label: "Pengaturan", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="p-5">
      <div className="mb-6">
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24</p>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-xs text-gray-500 mt-1">Internal panel operasional</p>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-[#F7FBFB] text-gray-900 font-semibold border"
                  : "text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border rounded-2xl p-4 bg-[#F7FBFB]">
        <p className="text-xs text-gray-500">Status</p>
        <p className="text-sm font-medium mt-1">UI: Stabil ✅</p>
        <p className="text-xs text-gray-500 mt-1">Data: Belum diaktifkan</p>
      </div>
    </div>
  );
}
