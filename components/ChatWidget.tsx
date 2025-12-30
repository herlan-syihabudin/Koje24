"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [closed, setClosed] = useState(false);

  const lastTsRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [sid, setSid] = useState("");

  /* =====================
     INIT SESSION
  ===================== */
  useEffect(() => {
    let v = localStorage.getItem("chat_session_id");
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem("chat_session_id", v);
    }
    setSid(v);
  }, []);

  /* =====================
     OPEN FROM NAVBAR
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
     AUTOSCROLL
  ===================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping, closed]);

  /* =====================
     START CHAT
  ===================== */
  const startChat = async () => {
    if (!userData.name.trim()) return;

    setStep("chat");
    setClosed(false);

    await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sid,
        name: userData.name,
        phone: userData.phone,
        topic: userData.topic,
        page: window.location.pathname,
      }),
    });
  };

  /* =====================
     START NEW SESSION (HYBRID MODE)
  ===================== */
  const startNewSession = async () => {
    const newSid = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newSid);
    setSid(newSid);

    setMessages([]);
    lastTsRef.current = 0;
    setMsg("");
    setClosed(false);
    setStep("chat");

    await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: newSid,
        name: userData.name || "Guest",
        phone: userData.phone,
        topic: userData.topic,
        page: window.location.pathname,
      }),
    });
  };

  /* =====================
     SEND MESSAGE
  ===================== */
  const send = async () => {
    if (!msg.trim() || sending || closed) return;

    const text = msg.trim();
    const ts = Date.now();

    setMessages((prev) => [
      ...prev,
      { id: `local_${ts}`, sid, role: "user", text, ts },
    ]);

    lastTsRef.current = ts;
    setMsg("");
    setSending(true);

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          message: text,
          sessionId: sid,
          page: window.location.pathname,
        }),
      });
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING
  ===================== */
  useEffect(() => {
    if (!open || step !== "chat") return;

    const i = setInterval(async () => {
      const r = await fetch(
        `/api/chat/poll?sid=${sid}&after=${lastTsRef.current}`,
        { cache: "no-store" }
      );
      const d = await r.json();
      if (!d?.ok) return;

      setAdminOnline(!!d.adminOnline);
      setAdminTyping(!!d.adminTyping);
      setClosed(!!d.closed);

      if (Array.isArray(d.messages) && d.messages.length) {
        setMessages((prev) => {
          const exists = new Set(prev.map((m) => m.id));
          const incoming = d.messages.filter(
            (m: ChatMessage) => !exists.has(m.id)
          );
          return [...prev, ...incoming].sort((a, b) => a.ts - b.ts);
        });

        lastTsRef.current = Math.max(
          lastTsRef.current,
          ...d.messages.map((m: ChatMessage) => m.ts)
        );
      }
    }, POLL_INTERVAL);

    return () => clearInterval(i);
  }, [open, step, sid]);

  if (!open) return null;

  return (
    <div
      className="
        fixed right-0 bottom-0 z-50
        w-full sm:w-[380px]
        h-[65vh] sm:h-[50vh]
        bg-white
        shadow-2xl border-l
        flex flex-col
        rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none
      "
    >
      {/* HEADER */}
      <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">Live Chat KOJE24</div>
          <div className="text-xs text-gray-500">
            {adminOnline ? "Admin online" : "Admin offline"}
          </div>
        </div>
        <button onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#fafafa]">
        {step === "form" ? (
          <>
            <p className="text-sm text-gray-600">
              👋 Hai! Sebelum mulai, isi nama dulu ya
            </p>
            <input
              placeholder="Nama kamu"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
            <button
              onClick={startChat}
              className="w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm font-medium"
            >
              Mulai Chat
            </button>
          </>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 text-sm leading-relaxed max-w-[78%] ${
                    m.role === "user"
                      ? "bg-[#0FA3A8] text-white rounded-2xl rounded-br-md"
                      : "bg-white border rounded-2xl rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {adminTyping && !closed && (
              <div className="text-xs text-gray-400 italic">
                Admin sedang mengetik…
              </div>
            )}

            {closed && (
              <div className="mt-4 bg-white border rounded-xl p-4 text-center text-sm">
                <div className="mb-1 font-medium">
                  🙏 Chat ini telah ditutup
                </div>
                <div className="text-gray-500 mb-3">
                  Kamu bisa mulai chat baru jika masih ada pertanyaan
                </div>
                <button
                  onClick={startNewSession}
                  className="w-full bg-[#0FA3A8] hover:bg-[#0d8e92] transition text-white py-2 rounded-xl font-medium"
                >
                  Mulai Chat Baru
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* INPUT */}
      {step === "chat" && !closed && (
        <div className="sticky bottom-0 bg-white border-t p-3">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={2}
            placeholder="Tulis pesan…"
            className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#0FA3A8]/30"
          />
          <button
            onClick={send}
            disabled={!msg.trim() || sending}
            className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            Kirim
          </button>
        </div>
      )}
    </div>
  );
}
