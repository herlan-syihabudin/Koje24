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
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const lastTsRef = useRef(0);

  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [closed, setClosed] = useState(false);

  const [sid, setSid] = useState<string>("");

  const [queueInfo, setQueueInfo] = useState<number | null>(null);
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
     OPEN / CLOSE FROM HEADER
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

      setGreetingTriggered(true);
    } catch {
      setGreetingTriggered(true);
    }
  };

  /* =====================
     FAST GREETING POLL
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

        if (Array.isArray(d.messages)) {
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

    setMessages((prev) => [
      ...prev,
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
      setErrorMsg("Gagal mengirim pesan 🙏");
    } finally {
      setSending(false);
    }
  };

  /* =====================
     POLLING LOOP
  ===================== */
  useEffect(() => {
    if (!open || step !== "chat" || !sid) return;

    const i = setInterval(async () => {
      try {
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

        const qr = await fetch(`/api/chat/queue-info?sid=${sid}`, {
          cache: "no-store",
        });
        const qd = await qr.json();
        setQueueInfo(typeof qd?.position === "number" ? qd.position : null);
      } catch {}
    }, POLL_INTERVAL);

    return () => clearInterval(i);
  }, [open, step, sid]);

  if (!open) return null;

  return (
    <aside
      className="
        fixed top-0 right-0 z-50
        h-full w-full sm:w-[380px]
        bg-white border-l shadow-2xl
        flex flex-col
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <div className="font-semibold text-sm">Chat Admin KOJE24</div>
          <div className="text-xs text-gray-500">
            {adminOnline ? "Admin online" : "Admin offline"}
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new Event("close-chat"))}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {errorMsg && <div className="text-xs text-red-600">{errorMsg}</div>}

        {queueInfo !== null && queueInfo > 0 && !closed && (
          <div className="bg-yellow-50 text-xs px-3 py-2 rounded-xl">
            ⏳ Kamu di antrian ke-{queueInfo}
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
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                    m.role === "user"
                      ? "bg-[#0FA3A8] text-white"
                      : "bg-gray-100"
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
            placeholder={
              closed ? "Chat ditutup" : "Tulis pesan…"
            }
            className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
          />
          <button
            onClick={send}
            disabled={!msg.trim() || sending || closed}
            className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm"
          >
            {sending ? "Mengirim…" : "Kirim"}
          </button>
        </div>
      )}
    </aside>
  );
}
