"use client"
import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import ChatWindow from "./ChatWindow"

export default function ChatBubble() {
  const [open, setOpen] = useState(false)

  // Tutup ketika user klik area luar
  useEffect(() => {
    const close = (e: any) => {
      const box = document.getElementById("chat-window")
      const bubble = document.getElementById("chat-bubble-btn")

      if (!box) return
      if (!open) return

      if (!box.contains(e.target) && !bubble?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div
          id="chat-window"
          className="animate-[fadeIn_0.25s_ease-out]"
        >
          <ChatWindow onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Floating Bubble */}
      <button
        id="chat-bubble-btn"
        onClick={() => setOpen(true)}
        className="
          fixed bottom-7 right-7 z-50
          w-14 h-14 rounded-full
          bg-[#0FA3A8] text-white shadow-xl
          flex items-center justify-center
          hover:bg-[#0c8c91] transition-all
          animate-[float_3s_ease-in-out_infinite]
        "
        style={{
          boxShadow: "0px 8px 24px rgba(15,163,168,0.32)",
        }}
      >
        <MessageCircle size={26} />
      </button>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0px); }
        }
      `}</style>
    </>
  )
}
