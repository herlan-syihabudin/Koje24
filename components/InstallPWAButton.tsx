"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return null;

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {deferredPrompt && (
        <button
          onClick={install}
          className="bg-[#0FA3A8] text-white px-4 py-2 rounded-full shadow-lg font-semibold"
        >
          📲 Install KOJE24
        </button>
      )}

      {!deferredPrompt && isIOS && (
        <div className="bg-white border shadow-lg rounded-xl p-3 text-xs max-w-[220px]">
          <b>Install KOJE24</b>
          <p className="mt-1">
            Tap <b>Share</b> → <b>Add to Home Screen</b>
          </p>
        </div>
      )}
    </div>
  );
}
