"use client";

import { useEffect, useRef, useState } from "react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ⛔ Klik di luar → close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

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
        <div className="relative" ref={ref}>
          {/* AVATAR */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-[#0FA3A8] text-white flex items-center justify-center font-semibold hover:opacity-90 transition"
          >
            A
          </button>

          {/* DROPDOWN */}
          {open && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setOpen(false)}
            >
              <div className="px-4 py-3 text-sm">
                <p className="font-semibold text-gray-800">Admin</p>
                <p className="text-xs text-gray-500 truncate">
                  admin@koje24
                </p>
              </div>

              <div className="border-t">
                <button
                  onClick={async () => {
                    await fetch("/api/dashboard/logout", { method: "POST" });
                    window.location.href = "/dashboard/login";
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
