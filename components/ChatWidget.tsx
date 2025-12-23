"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

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

/* =====================
   COMPONENT
===================== */
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
  const [lastTs, setLastTs] = useState(0);

  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* =====================
     BODY SCROLL LOCK
  ===================== */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* =====================
     SESSION ID
  ===================== */
  const getSessionId = () => {
    if (typeof window === "undefined") return "";
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", sid);
    }
    return sid;
  };

  const sid = useMemo(() => getSessionId(), []);

  /* =====================
     OPEN FROM HEADER
  ===================== */
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  /* =====================
     AUTO SCROLL
  ===================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping]);

  /* =====================
     START CHAT
  ===================== */
  const startChat = () => {
    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi ya kak 🙏");
      return;
    }

    localStorage.setItem("chat_user_data", JSON.stringify(userData));
    setErrorMsg("");
    setStep("chat");
  };

  /* =====================
     SEND MESSAGE
  ===================== */
  const send = async () => {
    if (!msg.trim() || sending) return;

    const text = msg.trim();
    setMsg("");
    setSending(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `local_${Date.now()}`,
        sid,
        role: "user",
        text,
        ts: Date.now(),
      },
    ]);

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

      if (!res.ok) throw new Error();
    } catch {
      setErrorMsg("Gagal mengirim pesan, silakan coba lagi 🙏");
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING
  ===================== */
  useEffect(() => {
    if (!open || step !== "chat") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/chat/poll?sid=${sid}&after=${lastTs}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!data?.ok) return;

        setAdminOnline(Boolean(data.adminOnline));
        setAdminTyping(Boolean(data.adminTyping));

        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of data.messages) {
              if (!ids.has(m.id)) merged.push(m);
            }
            return merged.sort((a, b) => a.ts - b.ts);
          });

          const newest = Math.max(...data.messages.map((m: ChatMessage) => m.ts));
          setLastTs((p) => Math.max(p, newest));
        }
      } catch {}
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [open, step, sid, lastTs]);

  /* =====================
     CLOSE CHAT (KRUSIAL)
  ===================== */
  const closeChat = async () => {
    try {
      await fetch("/api/chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
    } catch {}

    setOpen(false);
    setStep("form");
    setMessages([]);
    setLastTs(0);
    setMsg("");
    setErrorMsg("");

    localStorage.removeItem("chat_session_id");
    localStorage.removeItem("chat_user_data");
  };

  /* =====================
     RENDER
  ===================== */
  if (!open) return null;

return (
  <div
  className="
    fixed z-[999]
    inset-0
    w-full h-[100dvh]
    md:inset-auto
    md:bottom-4 md:right-4
    md:w-[380px] md:h-[600px]
    flex justify-center md:justify-end
    pointer-events-none
  "
>
    <div
  className="
    pointer-events-auto
    w-full h-full
    md:w-[380px] md:h-[600px]
    bg-white
    rounded-none md:rounded-2xl
    shadow-2xl
    border
    animate-slide-up
    flex flex-col
  "
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
        <button onClick={closeChat} className="text-gray-400">✕</button>
      </div>

      {/* BODY */}
      <div className="p-4">
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
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-2">
              {messages.length === 0 && (
                <div className="text-sm text-gray-500 p-2">
                  Pesan diterima 🙏  
                  Admin akan membalas sesuai antrian.
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-sm max-w-[85%]
                    ${
                      m.role === "user"
                        ? "bg-[#0FA3A8] text-white"
                        : "bg-white border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {adminTyping && (
                <div className="text-xs text-gray-400 mt-1">
                  ✍️ Admin sedang mengetik...
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Tulis pesan…"
              className="w-full border rounded-lg p-2 text-sm mt-2"
              rows={2}
            />

            <button
              onClick={send}
              disabled={!msg.trim() || sending}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {sending ? "Mengirim…" : "Kirim"}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);
}
