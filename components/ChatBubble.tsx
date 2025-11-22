"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (e: any) => {
      const box = document.getElementById("chat-window");
      const bubble = document.getElementById("chat-bubble-btn");

      if (!box || !open) return;

      if (!box.contains(e.target) && !bubble?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

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
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
