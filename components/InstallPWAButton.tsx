"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // cek pernah ditutup
    if (localStorage.getItem("hidePWA") === "1") {
      setHidden(true);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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
