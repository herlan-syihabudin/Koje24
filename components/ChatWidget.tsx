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

  // ✅ queue info
  const [queueInfo, setQueueInfo] = useState<number | null>(null);

  // ✅ trigger auto-poll greeting once after startChat
  const [greetingTriggered, setGreetingTriggered] = useState(false);

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
  const startChat = async () => {
    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi ya kak 🙏");
      return;
    }

    setErrorMsg("");
    setClosed(false);
    setStep("chat");

    // 🔥 trigger greeting server side
    try {
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

      // ✅ auto poll once to fetch greeting immediately
      setGreetingTriggered(true);
    } catch (e) {
      console.error("start chat failed", e);
      // tetep masuk chat, nanti polling interval yang ngangkat
      setGreetingTriggered(true);
    }
  };

  /* =====================
     AUTO POLL ONCE (GREETING FAST)
  ===================== */
  useEffect(() => {
    if (!open || step !== "chat" || !sid || !greetingTriggered) return;

    const run = async () => {
      try {
        const r = await fetch(`/api/chat/poll?sid=${sid}&after=0`, {
          cache: "no-store",
        });
        const d = await r.json();
        if (!d?.ok) return;

        setAdminOnline(!!d.adminOnline);
        setAdminTyping(!!d.adminTyping);

        if (Array.isArray(d.messages) && d.messages.length) {
          // set full, biar greeting langsung keangkat
          setMessages(d.messages);

          lastTsRef.current = Math.max(
            0,
            ...d.messages.map((m: ChatMessage) => m.ts)
          );
        }
      } catch {}
      setGreetingTriggered(false);
    };

    run();
  }, [open, step, sid, greetingTriggered]);

  /* =====================
     SEND MESSAGE
  ===================== */
  const send = async () => {
    if (!msg.trim() || sending || closed) return;

    const text = msg.trim();
    const ts = Date.now();

    // optimistic UI (biar responsif)
    setMessages((prev) => [
      ...prev,
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
     START NEW SESSION (ONLY WHEN USER CLICKS)
  ===================== */
  const startNewSession = async () => {
    const newSid = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newSid);
    setSid(newSid);

    setClosed(false);
    setErrorMsg("");
    setMessages([]);
    lastTsRef.current = 0;

    // tetap di chat, langsung trigger greeting
    setStep("chat");

    try {
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
      setGreetingTriggered(true);
    } catch {
      setGreetingTriggered(true);
    }
  };

  /* =====================
     POLLING (CHAT + QUEUE) ONE INTERVAL
  ===================== */
  useEffect(() => {
    if (!open || step !== "chat" || !sid) return;

    const i = setInterval(async () => {
      try {
        // 1) poll messages
        const r = await fetch(
          `/api/chat/poll?sid=${sid}&after=${lastTsRef.current}`,
          { cache: "no-store" }
        );
        const d = await r.json();
        if (d?.ok) {
          if (d.closed) {
            // ✅ DONT RESET SESSION HERE
            setClosed(true);
            setAdminTyping(false);
          } else {
            setClosed(false);
          }

          setAdminOnline(!!d.adminOnline);
          setAdminTyping(!!d.adminTyping);

          if (Array.isArray(d.messages) && d.messages.length) {
            setMessages((prev) => {
              const exists = new Set(prev.map((m) => m.id));
              const incoming = d.messages.filter(
                (m: ChatMessage) => !exists.has(m.id)
              );
              const merged = [...prev, ...incoming].sort((a, b) => a.ts - b.ts);
              return merged;
            });

            lastTsRef.current = Math.max(
              lastTsRef.current,
              ...d.messages.map((m: ChatMessage) => m.ts)
            );
          }
        }

        // 2) poll queue info (same interval)
        try {
          const qr = await fetch(`/api/chat/queue-info?sid=${sid}`, {
            cache: "no-store",
          });
          const qd = await qr.json();
          if (qd?.ok && typeof qd.position === "number") {
            setQueueInfo(qd.position);
          } else if (qd?.position === null) {
            setQueueInfo(null);
          }
        } catch {}
      } catch {}
    }, POLL_INTERVAL);

    return () => clearInterval(i);
  }, [open, step, sid]);

  /* =====================
     CLOSE CHAT (USER)
  ===================== */
  const closeChat = () => {
    setOpen(false);
    setStep("form");
    setMessages([]);
    setClosed(false);
    setMsg("");
    setErrorMsg("");
    lastTsRef.current = 0;

    // reset SID only when user closes UI
    const n = crypto.randomUUID();
    localStorage.setItem("chat_session_id", n);
    setSid(n);

    setQueueInfo(null);
    setGreetingTriggered(false);
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
          <button
            onClick={closeChat}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

          {/* QUEUE BANNER */}
          {step === "chat" && queueInfo !== null && queueInfo > 0 && !closed && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-xl px-3 py-2">
              ⏳ Kamu berada di antrian <b>ke-{queueInfo}</b>. Mohon tunggu ya 🙏
            </div>
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
                  key={m.id}
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
                <div className="bg-gray-50 border text-center text-xs text-gray-600 rounded-xl p-3 space-y-2">
                  <div>🙏 Terima kasih sudah menghubungi KOJE24</div>
                  <div>Jika masih ada pertanyaan, silakan mulai chat baru 🌿</div>
                  <button
                    onClick={startNewSession}
                    className="w-full bg-[#0FA3A8] hover:bg-[#0d8e92] transition text-white py-2 rounded-xl text-sm font-medium"
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
        {step === "chat" && (
          <div className="border-t p-3">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={closed ? "Chat ditutup. Mulai chat baru ya 🙏" : "Tulis pesan…"}
              rows={2}
              disabled={closed}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#0FA3A8]/30 disabled:bg-gray-100"
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
