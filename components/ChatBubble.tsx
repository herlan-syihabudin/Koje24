"use client"
import { useState } from "react"
import { MessageCircle } from "lucide-react"
import ChatWindow from "./ChatWindow"

export default function ChatBubble() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Chat Window */}
      {open && <ChatWindow onClose={() => setOpen(false)} />}

      {/* Floating Bubble */}
      <button
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
      `}</style>
    </>
  )
}
