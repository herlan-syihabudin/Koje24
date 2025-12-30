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
  }, [messages, adminTyping]);

  /* =====================
     START CHAT
  ===================== */
  const startChat = async () => {
    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi 🙏");
      return;
    }

    setErrorMsg("");
    setStep("chat");

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
    <div className="fixed inset-y-0 right-0 z-50 flex">
      <div
        className="
        bg-white
        w-[360px]
        max-w-[100vw]
        h-full
        sm:h-[92vh]
        sm:my-auto
        rounded-l-2xl
        shadow-2xl
        flex
        flex-col
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
          <button onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {step === "form" ? (
            <>
              <input
                placeholder="Nama"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <button
                onClick={startChat}
                className="w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm"
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

              {adminTyping && (
                <div className="text-xs text-gray-400 italic">
                  Admin sedang mengetik…
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
              placeholder="Tulis pesan…"
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
            />
            <button
              onClick={send}
              disabled={!msg.trim()}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm"
            >
              Kirim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
