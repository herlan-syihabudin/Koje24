"use client"

import { useState, useEffect } from "react"

export default function KOJE24Assistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [active, setActive] = useState(false)

  // Only show on /bantuan
  useEffect(() => {
    if (typeof window === "undefined") return
    setActive(window.location.pathname.includes("/bantuan"))
  }, [])

  if (!active) return null

  // Listen from bantuan page
  useEffect(() => {
    function handler(e: any) {
      const first = e.detail
      setOpen(true)
      if (first) sendMessage(first)
    }
    window.addEventListener("open-koje24", handler)
    return () => window.removeEventListener("open-koje24", handler)
  }, [])

  // Auto Reset 2 Minutes
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setMessages([])
      setOpen(false)
    }, 120000)
    return () => clearTimeout(timer)
  }, [open])

  // Main send
  async function sendMessage(text: string) {
  const userMsg = { role: "user", content: text }

  // tampilkan dulu di UI
  setMessages((prev) => [...prev, userMsg])

  // Pakai riwayat yang benar (state lama + pesan baru)
  const history = [...messages, userMsg]

  const res = await fetch("/api/koje24-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: history, // ⬅️ PENTING: bukan messages yang stale
    }),
  })

  const data = await res.json()

  const botMsg = {
    role: "assistant",
    content: data.reply,
  }

  setMessages((prev) => [...prev, botMsg])
}
        .then(res => res.json())
        .then(data => {
          setMessages(p => [...p, { role: "assistant", content: data.reply }])
        })
        .catch(() => {
          setMessages(p => [...p, { role: "assistant", content: "Lagi gangguan server bro 🙏" }])
        })

      return updated
    })
  }

  function submit(e: any) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput("")
  }

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-[#0FA3A8] text-white px-4 py-2 rounded-full shadow-lg z-[200]"
        onClick={() => setOpen(true)}
      >
        KOJE24 Assistant
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-[300]">
          <div className="w-full max-w-md bg-white rounded-t-2xl shadow-xl p-4 flex flex-col">

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[#0b4b50]">KOJE24 Assistant</h2>
              <button
                onClick={() => {
                  setMessages([])
                  setOpen(false)
                }}
              >
                ✕
              </button>
            </div>

            <div className="h-80 overflow-y-auto flex flex-col gap-3 p-1">
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

            <form onSubmit={submit} className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
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
