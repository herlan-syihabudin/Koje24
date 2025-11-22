"use client"
import { useState, useRef, useEffect } from "react"
import { X, SendHorizonal } from "lucide-react"

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Halo! Saya KOJE24 Assistant 🍃 Ada yang bisa saya bantu?",
    },
  ])
  const [input, setInput] = useState("")
  const chatRef = useRef(null)

  const quickReplies = [
    "Harga produk",
    "Varian KOJE24",
    "Cara order",
    "Layanan langganan",
    "Lokasi & pengiriman",
    "Testimoni",
  ]

  // auto-scroll every new message
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const sendMsg = () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { from: "user", text: input }])

    // Bot auto reply simple placeholders
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Baik, sedang saya cek ya… 🙏" },
      ])
    }, 500)

    setInput("")
  }

  return (
    <div
      className="
        fixed bottom-24 right-7 z-50
        w-[92%] max-w-sm
        bg-white rounded-3xl shadow-2xl
        border border-[#e6eeee]/70
        overflow-hidden
        animate-fadeIn
      "
    >
      {/* Header */}
      <div className="bg-[#0FA3A8] text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">KOJE24 Assistant</h3>
          <p className="text-xs text-white/80">Online • Siap membantu 🍃</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Chat Body */}
      <div
        ref={chatRef}
        className="h-80 overflow-y-auto px-4 py-3 space-y-3 bg-[#f7fdfd]"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
              m.from === "bot"
                ? "bg-white border border-[#e6eeee] text-gray-700"
                : "ml-auto bg-[#0FA3A8] text-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Quick Reply */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickReplies.map((q, i) => (
          <button
            key={i}
            onClick={() =>
              setMessages((prev) => [...prev, { from: "user", text: q }])
            }
            className="bg-[#eef7f7] border border-[#dceeee] text-[#0B4B50] rounded-full px-3 py-1 text-xs whitespace-nowrap hover:bg-[#e6f3f3]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[#e6eeee] p-3 flex items-center gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          className="flex-1 px-3 py-2 rounded-full border border-[#dceeee] text-sm focus:outline-none"
          placeholder="Tulis pesan..."
        />
        <button
          onClick={sendMsg}
          className="bg-[#0FA3A8] text-white p-2 rounded-full hover:bg-[#0c8c91] transition-all"
        >
          <SendHorizonal size={18} />
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  )
}
