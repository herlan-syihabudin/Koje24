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
     OPEN FROM HEADER ONLY
  ===================== */
  useEffect(() => {
    const handler = () => {
      setOpen(true);
    };
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  /* =====================
     PREFILL USER DATA
  ===================== */
  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem("chat_user_data");
    if (saved) {
      setUserData(JSON.parse(saved));
      setStep("chat");
    }
  }, [open]);

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
      setErrorMsg("Nama wajib diisi 🙏");
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

    // optimistic user bubble
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
      setErrorMsg("Gagal mengirim pesan 🙏");
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING (ADMIN STATUS + MESSAGE)
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
     RENDER
  ===================== */
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-end md:items-center justify-center">
      <div
        className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <MessageCircle size={18} /> Chat Admin KOJE24
            </div>
            <div className="text-xs text-gray-500">
              {adminOnline ? "🟢 Admin online" : "⚪ Admin offline"}
            </div>
          </div>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        {errorMsg && <div className="text-sm text-red-600 mb-2">{errorMsg}</div>}

        {/* FORM */}
        {step === "form" && (
          <>
            <input
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              placeholder="Nama"
              className="w-full border rounded p-2 text-sm mb-2"
            />
            <input
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              placeholder="No. WhatsApp (opsional)"
              className="w-full border rounded p-2 text-sm mb-2"
            />
            <select
              value={userData.topic}
              onChange={(e) => setUserData({ ...userData, topic: e.target.value })}
              className="w-full border rounded p-2 text-sm mb-3"
            >
              <option>Produk</option>
              <option>Langganan</option>
              <option>Pengiriman</option>
              <option>Komplain</option>
            </select>
            <button
              onClick={startChat}
              className="w-full bg-[#0FA3A8] text-white py-2 rounded"
            >
              Mulai Chat
            </button>
          </>
        )}

        {/* CHAT */}
        {step === "chat" && (
          <>
            <div className="h-[260px] overflow-y-auto border rounded p-2 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-sm text-gray-500 p-2">
                  Pesan kamu sudah terkirim, mohon tunggu admin membalas ya 🙏
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
                    className={`px-3 py-2 rounded-2xl text-sm max-w-[85%]
                    ${
                      m.role === "user"
                        ? "bg-[#0FA3A8] text-white rounded-br-sm"
                        : "bg-white text-[#0B4B50] rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {adminTyping && (
                <div className="text-xs text-gray-500 mt-1">
                  ✍️ Admin sedang mengetik...
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Tulis pertanyaan kamu..."
              className="w-full border rounded p-2 text-sm mt-2"
              rows={3}
            />

            <button
              onClick={send}
              disabled={!msg.trim() || sending}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
