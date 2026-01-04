"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/dashboard/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  };

  const Item = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`block rounded-xl px-3 py-2 text-sm border ${
          active ? "bg-[#E9F7F7] border-[#0FA3A8]" : "bg-white border-transparent hover:border-gray-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="bg-white border rounded-3xl shadow p-4 h-fit">
      <div className="px-2 pb-3">
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24</p>
        <p className="font-playfair text-lg">Dashboard</p>
      </div>

      <div className="space-y-2">
        <Item href="/dashboard" label="Overview" />
        <Item href="/dashboard/orders" label="Orders (soon)" />
        <Item href="/dashboard/promo" label="Promo (soon)" />
        <Item href="/dashboard/products" label="Produk (soon)" />
      </div>

      <div className="mt-4 pt-4 border-t">
        <button
          onClick={logout}
          className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
