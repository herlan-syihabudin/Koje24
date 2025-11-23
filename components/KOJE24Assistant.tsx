"use client"

import { useEffect, useState, useRef } from "react"

export default function KOJE24Assistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)

  // ======================================================
  // FIX 1: Listener hanya dibuat sekali
  // ======================================================
  useEffect(() => {
    function handler(e: any) {
      const first = e.detail
      setOpen(true)

      if (first) {
        sendMessage(first)
      }
    }

    window.addEventListener("open-koje24", handler)
    return () => window.removeEventListener("open-koje24", handler)
  }, [])

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // ======================================================
  // FIX 2: Kirim history chat terbaru ke API
  // ======================================================
  async function sendMessage(text: string) {
    const newMessages = [...messages, { role: "user", content: text }]
    setMessages(newMessages)

    const res = await fetch("/api/koje24-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    })

    const data = await res.json()

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ])
  }

  function handleSubmit(e: any) {
    e.preventDefault()
    if (!input.trim()) return

    sendMessage(input)
    setInput("")
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 bg-[#0FA3A8] text-white px-4 py-2 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        KOJE24 Assistant
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-t-2xl shadow-xl p-4 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[#0b4b50]">KOJE24 Assistant</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Chat */}
            <div
              ref={chatRef}
              className="h-80 overflow-y-auto flex flex-col gap-3 p-1"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "self-end bg-[#0FA3A8] text-white px-3 py-2 rounded-lg max-w-[80%]"
                      : "self-start bg-[#f0fbfb] text-[#0b4b50] px-3 py-2 rounded-lg max-w-[80%]"
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border border-[#cdeaea] rounded-full px-4 py-2 text-sm"
                placeholder="Tulis pesan..."
              />
              <button type="submit" className="bg-[#0FA3A8] text-white px-4 py-2 rounded-full">
                Kirim
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  )
}
