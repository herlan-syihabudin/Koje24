"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";

const SEEN_KEY = "koje24_chat_seen";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  // 🔹 Tutup kalau klik di luar
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const box = document.getElementById("chat-window");
      const bubble = document.getElementById("chat-bubble-btn");

      if (!box || !open) return;
      const target = e.target as HTMLElement;

      if (!box.contains(target) && !bubble?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // 🔹 Auto buka sekali (misal setelah 8 detik)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadySeen = window.localStorage.getItem(SEEN_KEY);
    if (alreadySeen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      window.localStorage.setItem(SEEN_KEY, "true");
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {open && <ChatWindow onClose={() => setOpen(false)} />}

      <button
        id="chat-bubble-btn"
        onClick={() => setOpen(true)}
        style={{ boxShadow: "0px 8px 24px rgba(15,163,168,0.32)" }}
        className={`
          fixed bottom-7 right-7 z-50
          w-14 h-14 rounded-full
          bg-[#0FA3A8] text-white shadow-xl
          flex items-center justify-center
          hover:bg-[#0c8c91] transition-all
          animate-floatingBubble
        `}
      >
        <MessageCircle size={26} />
      </button>

      <style jsx global>{`
        @keyframes floatingBubble {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-floatingBubble {
          animation: floatingBubble 2.4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
