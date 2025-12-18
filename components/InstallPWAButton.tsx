"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [hidden, setHidden] = useState(false);

  // ===============================
  // INIT
  // ===============================
  useEffect(() => {
    // jika user sudah tutup manual
    if (localStorage.getItem("hidePWA") === "1") {
      setHidden(true);
      return;
    }

    // jika sudah terinstall (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setHidden(true);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // tangkap beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // tangkap event INSTALLED (tracking)
    const onInstalled = () => {
      // anti double count
      if (localStorage.getItem("pwaInstalled") === "1") return;
      localStorage.setItem("pwaInstalled", "1");

      fetch("/api/pwa-installed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: getPlatform(),
          ua: navigator.userAgent,
        }),
      });

      setHidden(true);
    };

    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // ===============================
  // INSTALL HANDLER
  // ===============================
  const install = async () => {
    if (!deferredPrompt) {
      alert(
        isIOS
          ? "Di iPhone: tekan Share → Add to Home Screen"
          : "Install belum tersedia sekarang. Coba sebentar lagi."
      );
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // ===============================
  // CLOSE BUTTON
  // ===============================
  const close = () => {
    localStorage.setItem("hidePWA", "1");
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="fixed right-4 bottom-[96px] md:bottom-6 z-[9999]">
      <div className="relative bg-[#0FA3A8] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
        {/* CLOSE */}
        <button
          onClick={close}
          className="absolute -top-2 -right-2 bg-white text-gray-600 w-6 h-6 rounded-full text-xs font-bold shadow"
          aria-label="Close"
        >
          ✕
        </button>

        <button
          onClick={install}
          className="font-semibold active:scale-95 transition"
        >
          📲 Install KOJE24
        </button>
      </div>
    </div>
  );
}

// ===============================
// HELPER
// ===============================
function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "iOS";
  if (/android/.test(ua)) return "Android";
  return "Desktop";
}
