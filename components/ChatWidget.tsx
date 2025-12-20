"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

type UserData = { name: string; phone: string; topic: string };
type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

const IDLE_LIMIT = 60_000; // 1 menit

export default function ChatWidget() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");

  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastTs, setLastTs] = useState<number>(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [userData, setUserData] = useState<UserData>({
    name: "",
    phone: "",
    topic: "Produk",
  });

  /* ===========================
     SESSION ID
  ============================ */
  const getSessionId = () => {
    if (typeof window === "undefined") return "";
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", sid);
    }
    return sid;
  };

  const sid = useMemo(
    () => (typeof window === "undefined" ? "" : getSessionId()),
    []
  );

  /* ===========================
     IDLE TIMER HANDLER
  ============================ */
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, IDLE_LIMIT);
  };

  /* ===========================
     OPEN FROM HEADER ONLY
  ============================ */
  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      resetIdleTimer();
    };
    window.addEventListener("open-chat", openHandler);
    return () => window.removeEventListener("open-chat", openHandler);
  }, []);

  /* ===========================
     PREFILL DATA
  ============================ */
  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem("chat_user_data");
    if (saved) {
      setUserData(JSON.parse(saved));
      setStep("chat");
    }
  }, [open]);

  /* ===========================
     AUTO SCROLL
  ============================ */
  useEffect(() => {
    if (!open || step !== "chat") return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, step]);

  /* ===========================
     START CHAT
  ============================ */
  const startChat = () => {
    resetIdleTimer();

    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi 🙏");
      return;
    }

    setErrorMsg("");
    localStorage.setItem("chat_user_data", JSON.stringify(userData));
    setStep("chat");
  };

  /* ===========================
     SEND MESSAGE
  ============================ */
  const send = async () => {
    resetIdleTimer();

    if (!msg.trim() || sending) return;

    setSending(true);
    setErrorMsg("");

    const text = msg.trim();

    // optimistic bubble (LOCAL ONLY)
    setMessages((prev) => [
      ...prev,
      { id: `local_${Date.now()}`, sid, role: "user", text, ts: Date.now() },
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

      if (!res.ok) throw new Error("Send failed");
      setMsg("");
    } catch (e) {
      console.error("CHAT SEND ERROR:", e);
      setErrorMsg("Gagal mengirim pesan. Coba lagi ya 🙏");
    } finally {
      setSending(false);
    }
  };

  /* ===========================
     POLLING ADMIN REPLY
  ============================ */
  useEffect(() => {
    if (!open || step !== "chat") return;

    let alive = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/chat/poll?sid=${encodeURIComponent(sid)}&after=${lastTs}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!alive) return;

        if (data?.ok && Array.isArray(data.messages) && data.messages.length) {
          setMessages((prev) => {
            const existing = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of data.messages as ChatMessage[]) {
              if (!existing.has(m.id)) merged.push(m);
            }
            return merged.sort((a, b) => a.ts - b.ts);
          });

          const newest = Math.max(
            ...(data.messages as ChatMessage[]).map((m) => m.ts)
          );
          setLastTs((prev) => Math.max(prev, newest));
        }
      } catch {}
    }, 2000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [open, step, sid, lastTs]);

  /* ===========================
     RENDER
  ============================ */
  if (!open) return null; // ❌ NO FLOATING BUTTON, NO HOME BUBBLE

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 flex items-end md:items-center justify-center"
      onClick={resetIdleTimer}
    >
      <div
        className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 font-semibold">
            <MessageCircle size={18} /> Chat Admin KOJE24
          </div>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        {errorMsg && <div className="text-sm text-red-600 mb-2">{errorMsg}</div>}

        {step === "form" && (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Sebelum chat, isi data singkat dulu ya 🙏
            </p>

            <input
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              placeholder="Nama"
              className="w-full border rounded p-2 text-sm mb-2"
            />

            <input
              value={userData.phone}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
              placeholder="No. WhatsApp (opsional)"
              className="w-full border rounded p-2 text-sm mb-2"
            />

            <select
              value={userData.topic}
              onChange={(e) =>
                setUserData({ ...userData, topic: e.target.value })
              }
              className="w-full border rounded p-2 text-sm mb-3"
            >
              <option value="Produk">Produk</option>
              <option value="Langganan">Langganan</option>
              <option value="Pengiriman">Pengiriman</option>
              <option value="Komplain">Komplain</option>
            </select>

            <button
              onClick={startChat}
              className="w-full bg-[#0FA3A8] text-white py-2 rounded hover:bg-[#0B4B50]"
            >
              Mulai Chat
            </button>
          </>
        )}

        {step === "chat" && (
          <>
            <div className="h-[260px] overflow-y-auto border rounded p-2 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm
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
              <div ref={bottomRef} />
            </div>

            <textarea
              value={msg}
              onChange={(e) => {
                setMsg(e.target.value);
                resetIdleTimer();
              }}
              placeholder="Tulis pertanyaan kamu..."
              className="w-full border rounded p-2 text-sm mt-2"
              rows={3}
            />

            <button
              onClick={send}
              disabled={sending || !msg.trim()}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded hover:bg-[#0B4B50] disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
