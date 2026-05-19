"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

interface TopbarClientProps {
  user: {
    name: string;
    email: string;
    initial: string;
  };
}

export default function TopbarClient({ user }: TopbarClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/dashboard/logout", { method: "POST" });
      
      if (response.ok) {
        router.push("/dashboard/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  return (
    <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        {/* LEFT */}
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs text-gray-500">
            Dashboard operasional KOJE24
          </p>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] focus:ring-offset-2"
            aria-label="Menu pengguna"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0FA3A8] to-[#0D8B8F] text-white flex items-center justify-center font-semibold text-sm">
              {user.initial}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* DROPDOWN */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-xl overflow-hidden z-20"
            >
              <div className="px-4 py-3 border-b bg-gray-50/50">
                <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user.email}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profile
                </button>
                <button
                  onClick={() => router.push("/dashboard/settings")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Settings
                </button>
              </div>

              <div className="border-t">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
