"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function InstallPWAButton() {
  const pathname = usePathname();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  /* =====================
     BLOCK DI PAGE TERTENTU
  ===================== */
  const BLOCKED_PATHS = [
    "/invoice",
    "/checkout",
    "/success",
    "/print",
  ];

  useEffect(() => {
    if (BLOCKED_PATHS.some(p => pathname.startsWith(p))) return;

    // sudah di hide sebelumnya
    if (localStorage.getItem("pwa_hide") === "1") return;

    // sudah terinstall
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    /* =====================
       SCROLL TRIGGER
    ===================== */
    const onScroll = () => {
      const scrolled =
        window.scrollY /
        (document.body.scrollHeight - window.innerHeight);

      if (scrolled > 0.4) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll);

    /* =====================
       ANDROID INSTALL PROMPT
    ===================== */
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      localStorage.setItem("pwa_installed", "1");
      setVisible(false);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [pathname]);

  if (!visible) return null;

  /* =====================
     INSTALL ACTION
  ===================== */
  const install = async () => {
    if (isIOS) {
      alert("📲 iPhone: tekan Share → Add to Home Screen");
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const close = () => {
    localStorage.setItem("pwa_hide", "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[9999]">
      <div className="relative bg-[#0FA3A8] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-[260px]">
        <button
          onClick={close}
          className="absolute -top-2 -right-2 bg-white text-gray-600 w-6 h-6 rounded-full text-xs font-bold"
        >
          ✕
        </button>

        <button
          onClick={install}
          className="text-sm font-semibold leading-tight"
        >
          📲 Install KOJE24  
          <div className="text-xs opacity-80">
            Akses lebih cepat & offline
          </div>
        </button>
      </div>
    </div>
  );
}
