"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/dashboard/logout", { method: "POST" });
      window.location.href = "/dashboard/login"; // FULL reload
    } catch {
      alert("Logout gagal");
      setLoading(false);
    }
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
        <div className="relative">
          {/* Avatar */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-[#0FA3A8] text-white flex items-center justify-center font-semibold"
          >
            A
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-xs text-gray-500">Admin</p>
                <p className="text-sm font-medium truncate">
                  admin@koje24
                </p>
              </div>

              <button
                onClick={logout}
                disabled={loading}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
