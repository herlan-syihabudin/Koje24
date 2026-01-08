"use client";

import { LogOut } from "lucide-react";

export default function Topbar() {
  const logout = async () => {
    if (!confirm("Yakin mau logout?")) return;
    await fetch("/api/dashboard/logout", { method: "POST" });
    window.location.href = "/dashboard/login";
  };
  return (
    <header className="border-b bg-white">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* LEFT */}
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900">
            Welcome back 👋
          </h1>
          <p className="text-xs text-gray-500">
            Dashboard operasional KOJE24
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}
