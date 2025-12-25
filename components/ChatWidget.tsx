"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

/* =====================
   TYPES
===================== */
type UserData = {
  name: string;
  phone?: string;
  topic?: string;
};

type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

const POLL_INTERVAL = 2000;
const SEND_COOLDOWN = 800;

/* =====================
   LOCAL SYSTEM MESSAGES
===================== */
function greeting(name: string): ChatMessage {
  return {
    id: "greeting",
    sid: "local",
    role: "admin",
    text: `👋 Hai ${name || "kak"}, selamat datang di KOJE24 🌿

Aku admin KOJE24.  
Silakan tulis pertanyaan kamu ya 😊`,
    ts: 0,
  };
}

function offlineMessage(): ChatMessage {
  return {
    id: "offline",
    sid: "local",
    role: "admin",
    text: `🙏 Terima kasih sudah menghubungi KOJE24  
Saat ini admin sedang offline.  
Silakan tulis pesan, kami akan membalas secepatnya 🌿`,
    ts: 0,
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");

  const [userData, setUserData] = useState<UserData>({ name: "" });
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [closed, setClosed] = useState(false);

  const [sid, setSid] = useState("");
  const lastTsRef = useRef(0);
  const lastSendRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
    if (!userData.name.trim()) return;

    if (closed) {
      const n = crypto.randomUUID();
      localStorage.setItem("chat_session_id", n);
      setSid(n);
    }

    setClosed(false);
    lastTsRef.current = 0;

    setMessages([greeting(userData.name)]);
    setStep("chat");
  };

  /* =====================
     SEND MESSAGE (USER)
  ===================== */
  const send = async () => {
    if (!msg.trim() || sending || closed) return;

    const now = Date.now();
    if (now - lastSendRef.current < SEND_COOLDOWN) return;
    lastSendRef.current = now;

    const text = msg.trim();
    const ts = Date.now();

    // optimistic user message
    setMessages((p) => [
      ...p,
      { id: `local_${ts}`, sid, role: "user", text, ts },
    ]);

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
      // silent fail (UX tetap jalan)
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING (FIX UTAMA DI SINI)
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

        // tampilkan offline message sekali saja
        if (!d.adminOnline) {
          setMessages((p) =>
            p.find((m) => m.id === "offline")
              ? p
              : [...p, offlineMessage()]
          );
        }

        // 🔥 FIX: JANGAN FILTER ROLE DI POLLING
        if (Array.isArray(d.messages) && d.messages.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));

            const incoming = d.messages.filter(
              (m: ChatMessage) => !ids.has(m.id)
            );

            return [...prev, ...incoming].sort((a, b) => a.ts - b.ts);
          });

          lastTsRef.current = Math.max(
            lastTsRef.current,
            ...d.messages.map((m: ChatMessage) => m.ts)
          );
        }
      } catch {
        // silent polling fail
      }
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
    lastTsRef.current = 0;

    const n = crypto.randomUUID();
    localStorage.setItem("chat_session_id", n);
    setSid(n);
  };

  if (!open) return null;

  return (
    <div className="koje-modal-overlay">
      <div className="koje-modal-box w-[92%] sm:w-[380px] max-h-[85vh] flex flex-col">
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
          {step === "form" ? (
            <>
              <input
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                placeholder="Nama"
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              />
              <button
                onClick={startChat}
                className="w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm"
              >
                Mulai Chat
              </button>
            </>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 ${
                    m.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div className="inline-block px-3 py-2 rounded-xl text-sm border">
                    {m.text}
                  </div>
                </div>
              ))}

              {adminTyping && !closed && (
                <div className="text-xs text-gray-400">
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
              rows={2}
              disabled={closed}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <button
              onClick={send}
              disabled={closed || sending}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm"
            >
              Kirim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
