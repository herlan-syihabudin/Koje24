"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
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
          : "Browser belum mengizinkan install sekarang. Coba scroll / tunggu sebentar."
      );
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <button
        onClick={install}
        className="bg-[#0FA3A8] text-white px-5 py-3 rounded-full shadow-lg font-semibold active:scale-95 transition"
      >
        📲 Install KOJE24
      </button>
    </div>
  );
}
