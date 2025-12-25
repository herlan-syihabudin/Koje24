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
     AUTO SCROLL
  ===================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping, closed]);

  /* =====================
     START CHAT
  ===================== */
  const startChat = () => {
    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi ya kak 🙏");
      return;
    }

    setErrorMsg("");
    setClosed(false);
    setStep("chat");
  };

  /* =====================
     SEND MESSAGE
  ===================== */
  const send = async () => {
    if (!msg.trim() || sending || closed) return;

    const text = msg.trim();
    const ts = Date.now();

    lastTsRef.current = Math.max(lastTsRef.current, ts);
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
    } catch {
      setErrorMsg("Gagal mengirim pesan 🙏");
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING (STABLE)
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

  // 🔑 RESET SESSION BIAR BISA CHAT BARU
  const newSid = crypto.randomUUID();
  localStorage.setItem("chat_session_id", newSid);
  setSid(newSid);

  // BALIK KE FORM
  setStep("form");
  setMessages([]);
  lastTsRef.current = 0;

  return;
}
        setAdminOnline(!!d.adminOnline);
        setAdminTyping(!!d.adminTyping);

        if (Array.isArray(d.messages) && d.messages.length) {
          setMessages((prev) => {
            const exists = new Set(
              prev.map((m) => `${m.role}-${m.ts}-${m.text}`)
            );

            const incoming = d.messages.filter(
              (m: ChatMessage) =>
                !exists.has(`${m.role}-${m.ts}-${m.text}`)
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
     CLOSE CHAT
  ===================== */
  const closeChat = () => {
    setOpen(false);
    setStep("form");
    setMessages([]);
    setClosed(false);
    setMsg("");
    setErrorMsg("");
    lastTsRef.current = 0;

    const n = crypto.randomUUID();
    localStorage.setItem("chat_session_id", n);
    setSid(n);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-[92%] sm:w-[380px] max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center">
              <MessageCircle size={18} className="text-[#0FA3A8]" />
            </div>
            <div>
              <div className="font-semibold text-sm">Chat Admin KOJE24</div>
              <div className="text-xs flex items-center gap-1 text-gray-500">
                <span
                  className={`w-2 h-2 rounded-full ${
                    adminOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {adminOnline ? "Admin online" : "Admin offline"}
              </div>
            </div>
          </div>
          <button onClick={closeChat} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {errorMsg && (
            <div className="text-sm text-red-600">{errorMsg}</div>
          )}

          {step === "form" ? (
            <>
              <input
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                placeholder="Nama"
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <button
                onClick={startChat}
                className="w-full bg-[#0FA3A8] hover:bg-[#0d8e92] transition text-white py-2 rounded-xl text-sm font-medium"
              >
                Mulai Chat
              </button>
            </>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={`${m.role}-${m.ts}-${m.text}`}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm ${
                      m.role === "user"
                        ? "bg-[#0FA3A8] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {adminTyping && !closed && (
                <div className="text-xs text-gray-400 italic">
                  ✍️ Admin sedang mengetik…
                </div>
              )}

              {closed && (
                <div className="bg-gray-50 text-center text-xs text-gray-500 rounded-xl p-3">
                  🔒 Percakapan telah ditutup oleh admin
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
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#0FA3A8]/30"
            />
            <button
              onClick={send}
              disabled={closed || !msg.trim() || sending}
              className="mt-2 w-full bg-[#0FA3A8] hover:bg-[#0d8e92] transition text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {sending ? "Mengirim…" : "Kirim"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
