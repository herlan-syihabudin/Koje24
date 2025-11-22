"use client"

import { useState, useRef, useEffect } from "react"
import { X, SendHorizonal } from "lucide-react"

interface ChatWindowProps {
  onClose: () => void
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Halo! Ada yang bisa dibantu tentang KOJE24? 😊🍃",
    },
  ])

  const [input, setInput] = useState("")
  const chatRef = useRef<HTMLDivElement | null>(null)

  // AUTO SCROLL TO BOTTOM
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  // BOT AUTOREPLY LOGIC
  const botReply = (userMsg: string) => {
    const lower = userMsg.toLowerCase()

    if (lower.includes("harga"))
      return "Harga per botol KOJE24 mulai Rp25.000 – Rp35.000 ya kak 🍃"

    if (lower.includes("order") || lower.includes("beli"))
      return "Kamu bisa order langsung dari website atau klik tombol WhatsApp untuk chat admin 😊"

    if (lower.includes("varian"))
      return "Varian tersedia: Green Detox, Yellow Immunity, Beetroot, Sunrise, Carrot Boost, Ginger Shot!"

    if (lower.includes("cara minum"))
      return "Saran pemakaian: minum pagi hari sebelum makan untuk hasil terbaik 💚"

    return "Siap kak! Ada lagi yang mau ditanyakan seputar KOJE24? 🙌"
  }

  // SEND MESSAGE
  const sendMsg = () => {
    if (!input.trim()) return

    const msg = input
    setMessages((prev) => [...prev, { from: "user", text: msg }])
    setInput("")

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: botReply(msg) }])
    }, 500)
  }

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-3xl shadow-xl border overflow-hidden z-[9999]">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0FA3A8] text-white">
        <span className="font-semibold">KOJE24 Assistant</span>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* CHAT CONTENT */}
      <div
        ref={chatRef}
        className="h-72 p-4 overflow-y-auto space-y-3 bg-[#F8FAFA]"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
              m.from === "user"
                ? "ml-auto bg-[#0FA3A8] text-white"
                : "bg-white border text-gray-700"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* INPUT FIELD */}
      <div className="flex items-center gap-2 p-3 border-t bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Tulis pesan..."
          className="flex-1 px-3 py-2 border rounded-full text-sm"
        />

        <button
          onClick={sendMsg}
          className="p-2 bg-[#0FA3A8] text-white rounded-full"
        >
          <SendHorizonal size={18} />
        </button>
      </div>
    </div>
  )
}
