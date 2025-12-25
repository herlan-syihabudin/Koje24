"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

/* =====================
   TYPES
===================== */
type UserData = {
  name: string;
  phone: string;
  topic: string;
};

type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

const POLL_INTERVAL = 2000;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");

  const [userData, setUserData] = useState<UserData>({
    name: "",
    phone: "",
    topic: "Produk",
  });

  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const lastTsRef = useRef(0);

  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [closed, setClosed] = useState(false);

  const [sid, setSid] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* =====================
     INIT SESSION ID
  ===================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let v = localStorage.getItem("chat_session_id");
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem("chat_session_id", v);
    }
    setSid(v);
  }, []);

  /* =====================
     OPEN / CLOSE EVENT
  ===================== */
  useEffect(() => {
    const openEvent = () => setOpen(true);
    const closeEvent = () => setOpen(false);

    window.addEventListener("open-chat", openEvent);
    window.addEventListener("close-chat", closeEvent);
    return () => {
      window.removeEventListener("open-chat", openEvent);
      window.removeEventListener("close-chat", closeEvent);
    };
  }, []);

  /* =====================
     BODY SCROLL LOCK
  ===================== */
  useEffect(() => {
    document.body.classList.toggle("body-cart-lock", open);
  }, [open]);

  /* =====================
     AUTO SCROLL
  ===================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping, closed]);

  /* =====================
     START CHAT (AUTO RESET)
  ===================== */
  const startChat = () => {
    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi ya kak 🙏");
      return;
    }

    if (closed) {
      const newSid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", newSid);
      setSid(newSid);
    }

    setClosed(false);
    setMessages([]);
    lastTsRef.current = 0;
    setErrorMsg("");

    localStorage.setItem("chat_user_data", JSON.stringify(userData));
    setStep("chat");
  };

  /* =====================
     SEND MESSAGE (OPTIMISTIC)
  ===================== */
  const send = async () => {
    if (!msg.trim() || sending || closed) return;

    const text = msg.trim();
    const ts = Date.now();

    // Optimistic UI (USER ONLY)
    setMessages((p) => [
      ...p,
      {
        id: `local_${ts}`,
        sid,
        role: "user",
        text,
        ts,
      },
    ]);

    lastTsRef.current = Math.max(lastTsRef.current, ts);
    setMsg("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          message: text,
          sessionId: sid,
          page: window.location.pathname,
        }),
      });

      if (!res.ok) throw new Error("Send failed");
    } catch {
      setErrorMsg("Gagal mengirim pesan 🙏");
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING (ADMIN ONLY)
  ===================== */
  useEffect(() => {
    if (!open || step !== "chat" || closed || !sid) return;

    const i = setInterval(async () => {
      try {
        const r = await fetch(
          `/api/chat/poll?sid=${sid}&after=${lastTsRef.current}`,
          { cache: "no-store" }
        );
        const d = await r.json();
        if (!d?.ok) return;

        if (d.closed) {
          setClosed(true);
          setAdminTyping(false);
          return;
        }

        setAdminOnline(!!d.adminOnline);
        setAdminTyping(!!d.adminTyping);

        // 🔥 FIX UTAMA: HANYA TERIMA PESAN ADMIN
        if (Array.isArray(d.messages) && d.messages.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));

            const incoming = d.messages.filter(
              (m: ChatMessage) =>
                m.role === "admin" && !ids.has(m.id)
            );

            return [...prev, ...incoming].sort((a, b) => a.ts - b.ts);
          });

          lastTsRef.current = Math.max(
            lastTsRef.current,
            ...d.messages.map((m: ChatMessage) => m.ts)
          );
        }
      } catch {}
    }, POLL_INTERVAL);

    return () => clearInterval(i);
  }, [open, step, sid, closed]);

  /* =====================
     CLOSE CHAT (USER)
  ===================== */
  const closeChat = () => {
    setOpen(false);
    setStep("form");
    setMessages([]);
    lastTsRef.current = 0;
    setMsg("");
    setErrorMsg("");
    setClosed(false);

    const newSid = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newSid);
    setSid(newSid);
  };

  if (!open) return null;

  return (
    <div
      className="koje-modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && closeChat()}
    >
      <div
        className="koje-modal-box w-[92%] sm:w-[380px] max-h-[85vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} />
            <div>
              <div className="font-semibold text-sm">Chat Admin KOJE24</div>
              <div className="text-xs text-gray-500">
                {adminOnline ? "🟢 Admin online" : "⚪ Admin offline"}
              </div>
            </div>
          </div>
          <button onClick={closeChat}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {errorMsg && (
            <div className="text-sm text-red-600 mb-2">{errorMsg}</div>
          )}

          {step === "form" && (
            <>
              <input
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                placeholder="Nama"
                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
              />
              <input
                value={userData.phone}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                placeholder="No. WhatsApp (opsional)"
                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
              />
              <select
                value={userData.topic}
                onChange={(e) =>
                  setUserData({ ...userData, topic: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              >
                <option>Produk</option>
                <option>Langganan</option>
                <option>Pengiriman</option>
                <option>Komplain</option>
              </select>
              <button
                onClick={startChat}
                className="w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm"
              >
                Mulai Chat
              </button>
            </>
          )}

          {step === "chat" && (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                      m.role === "user"
                        ? "bg-[#0FA3A8] text-white"
                        : "bg-white border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {adminTyping && !closed && (
                <div className="text-xs text-gray-400 mt-1">
                  ✍️ Admin sedang mengetik...
                </div>
              )}

              {closed && (
                <div className="text-center text-xs text-gray-400 mt-3">
                  🙏 Terima kasih sudah menghubungi KOJE24  
                  <br />
                  Silakan mulai chat baru jika masih ada pertanyaan 🌿
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* INPUT */}
        {step === "chat" && (
          <div className="border-t p-3">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={closed ? "Chat telah ditutup" : "Tulis pesan…"}
              rows={2}
              disabled={closed}
              className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100"
            />
            <button
              onClick={send}
              disabled={closed || !msg.trim() || sending}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {closed ? "Chat Ditutup" : sending ? "Mengirim…" : "Kirim"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
