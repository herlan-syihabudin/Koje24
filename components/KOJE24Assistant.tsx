"use client"

import { useState, useEffect, useRef } from "react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function KOJE24Assistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [active, setActive] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

  // ==========================================================
  // AKTIFKAN HANYA DI /pusat-bantuan (atau url yang mengandung "bantuan")
  // ==========================================================
  useEffect(() => {
    if (typeof window === "undefined") return
    const p = window.location.pathname
    if (p.includes("bantuan")) {
      setActive(true)
    }
  }, [])

  // ==========================================================
  // WELCOME MESSAGE + LOAD HISTORY (localStorage)
  // ==========================================================
  useEffect(() => {
    if (!active) return
    if (typeof window === "undefined") return

    try {
      const saved = window.localStorage.getItem("koje24-chat")
      if (saved) {
        setMessages(JSON.parse(saved))
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              "Halo 👋 Aku KOJE24 Assistant. Ceritakan keluhan atau tujuanmu, nanti aku bantu pilih varian yang pas ya."
          }
        ])
      }
    } catch {
      // fallback kalau JSON error
      setMessages([
        {
          role: "assistant",
          content:
            "Halo 👋 Aku KOJE24 Assistant. Ceritakan keluhan atau tujuanmu, nanti aku bantu pilih varian yang pas ya."
        }
      ])
    }
  }, [active])

  // ==========================================================
  // SIMPAN HISTORY + AUTO SCROLL BAWAH
  // ==========================================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("koje24-chat", JSON.stringify(messages))
      } catch {
        // abaikan kalau quota penuh
      }
    }

    if (bodyRef.current) {
      const el = bodyRef.current
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    }
  }, [messages])

  // ==========================================================
  // EVENT LISTENER DARI FORM / PUSAT BANTUAN
  // ==========================================================
  useEffect(() => {
    function handler(e: any) {
      if (!e?.detail) return
      setOpen(true)
      sendMessage(e.detail)
    }

    window.addEventListener("open-koje24", handler)
    return () => window.removeEventListener("open-koje24", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ==========================================================
  // AUTO RESET 2 MENIT SETELAH CHAT TERBUKA (INAKTIF)
  // ==========================================================
  useEffect(() => {
    if (!open) {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
      return
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = setTimeout(() => {
      setMessages([])
      setOpen(false)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("koje24-chat")
      }
    }, 120000)

    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
    }
  }, [open, messages.length])

  // ==========================================================
  // KIRIM PESAN KE API + TYPING INDICATOR
  // ==========================================================
  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = { role: "user", content: trimmed }

    setIsTyping(true)

    setMessages(prev => {
      const newHistory = [...prev, userMsg]

      fetch("/api/koje24-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      })
        .then(res => res.json())
        .then(data => {
          const botMsg: ChatMessage = {
            role: "assistant",
            content:
              data.reply || "Siap kak, ada lagi yang mau ditanya? 😊",
          }
          setMessages(h => [...h, botMsg])
        })
        .catch(() => {
          const errMsg: ChatMessage = {
            role: "assistant",
            content:
              "Maaf kak, server lagi gangguan sebentar 🙏 coba kirim ulang ya.",
          }
          setMessages(h => [...h, errMsg])
        })
        .finally(() => {
          setIsTyping(false)
        })

      return newHistory
    })
  }

  function submit(e: any) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput("")
  }

  if (!active) return null

  // ==========================================================
  // UI SUPER PREMIUM
  // ==========================================================
  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 bg-[#0FA3A8] text-white px-4 py-2 rounded-full shadow-2xl hover:shadow-[0_0_25px_rgba(15,163,168,0.6)] transition-all duration-300 z-[200] flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <span className="text-lg">🤖</span>
        <span className="font-medium">KOJE24</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-[300]">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up-high">

            {/* HEADER */}
            <div className="px-5 py-4 bg-white/90 backdrop-blur-xl border-b border-[#e6f5f5] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0FA3A8] flex items-center justify-center text-white font-bold">
                  K
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#0b4b50] tracking-tight">
                    KOJE24 Assistant
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Online • Jawaban cepat dalam hitungan detik
                  </p>
                </div>
              </div>

              <button
                className="text-[#0b4b50] hover:text-[#0FA3A8] transition"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* CHAT BODY */}
            <div
              ref={bodyRef}
              id="chat-body"
              className="h-96 overflow-y-auto px-4 py-4 space-y-4 bg-[#f6fefe]"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar bot */}
                  {m.role !== "user" && (
                    <div className="w-7 h-7 rounded-full bg-[#0FA3A8] text-white flex items-center justify-center text-xs">
                      K
                    </div>
                  )}

                  <div
                    className={
                      m.role === "user"
                        ? "bg-[#0FA3A8] text-white px-4 py-2.5 rounded-3xl rounded-br-md max-w-[75%] shadow"
                        : "bg-white border border-[#d9eded] text-[#0b4b50] px-4 py-2.5 rounded-3xl rounded-bl-md max-w-[75%] shadow"
                    }
                  >
                    {m.content}
                  </div>

                  {/* Avatar user */}
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-[#e3f7f7] border border-[#cdeaea] flex items-center justify-center text-xs text-[#0b4b50]">
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* TYPING INDICATOR */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0FA3A8] text-white flex items-center justify-center text-xs">
                    K
                  </div>
                  <div className="bg-white border border-[#d9eded] px-4 py-2.5 rounded-3xl rounded-bl-md shadow max-w-[60%]">
                    <div className="flex gap-1">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK REPLIES */}
            <div className="px-4 pb-2 pt-1 flex gap-2 overflow-x-auto bg-white/90">
              {[
                "Rekomendasi detox harian",
                "Varian aman untuk maag",
                "Varian untuk imun harian",
                "Jus untuk pencernaan & begah",
                "Tanya kandungan jus KOJE24",
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="bg-[#e5f7f7] text-[#0b4b50] px-3 py-1.5 rounded-full text-xs border border-[#cdeaea] hover:bg-[#dff1f1] transition whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* INPUT AREA */}
            <form onSubmit={submit} className="p-4 bg-white border-t border-[#e3f3f3]">
              <div className="flex items-center gap-2 bg-[#f0fbfb] border border-[#d6eded] rounded-full px-4 py-2.5">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-[#0b4b50] placeholder:text-slate-400"
                  placeholder="Tulis pesan…"
                />
                <button
                  type="submit"
                  className="bg-[#0FA3A8] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-[#0b8f93] transition"
                >
                  Kirim
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}
