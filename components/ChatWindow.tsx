"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, SendHorizonal } from "lucide-react";

type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
};

const STORAGE_KEY = "koje24_chat_history";
const MAX_CONTEXT = 10;
const MIN_SEND_INTERVAL = 1000; // 1 detik
const AUTO_CLOSE_TIME = 180000; // 3 menit
const LOADING_TIMEOUT = 10000; // 10 detik

const QUICK_REPLIES = [
  { label: "Rekomendasi varian detox", text: "Aku mau rekomendasi varian untuk detox harian dong." },
  { label: "Untuk imun & stamina", text: "Varian mana yang paling bagus buat jaga imun & stamina?" },
  { label: "Cara order di KOJE24", text: "Gimana cara order di KOJE24 dari web ini?" },
  { label: "Penyimpanan & masa simpan", text: "Jus KOJE24 tahan berapa lama dan disimpan bagaimana?" },
];

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSendTime, setLastSendTime] = useState(0);
  const [userScrolled, setUserScrolled] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  // === LOAD HISTORY
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {}
    }

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        from: "bot",
        text: "Halo! Aku KOJE24 Assistant. Ada yang bisa aku bantu hari ini? 😊",
      },
    ]);
  }, []);

  // === SAVE HISTORY
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // === AUTO CLOSE TIMER (FIXED)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      onClose();
    }, AUTO_CLOSE_TIME);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [messages, onClose]);

  // === LOADING TIMEOUT
  useEffect(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        setMessages(prev => [...prev, {
          id: `timeout-${Date.now()}`,
          from: "bot",
          text: "Maaf, loading terlalu lama. Coba lagi ya 🙏",
        }]);
      }, LOADING_TIMEOUT);
    }

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [loading]);

  // === SCROLL DETECTION
  useEffect(() => {
    const chatDiv = chatRef.current;
    if (!chatDiv) return;
    
    const handleScroll = () => {
      const isAtBottom = Math.abs(chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight) < 10;
      setUserScrolled(!isAtBottom);
    };
    
    chatDiv.addEventListener('scroll', handleScroll);
    return () => chatDiv.removeEventListener('scroll', handleScroll);
  }, []);

  // === AUTO SCROLL (with user scroll detection)
  useEffect(() => {
    if (!userScrolled && chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, userScrolled]);

  // === SEND MESSAGE (with rate limiting)
  const sendMessage = useCallback(async (text?: string) => {
    const now = Date.now();
    if (now - lastSendTime < MIN_SEND_INTERVAL) return;
    
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setLastSendTime(now);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      from: "user",
      text: content,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.slice(-MAX_CONTEXT).map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/koje24-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const replyText = data?.reply ?? "Maaf, coba ulang beberapa saat lagi ya 🙏";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}-${Math.random()}`,
        from: "bot",
        text: replyText,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          from: "bot",
          text: "Maaf, koneksi lagi gangguan. Coba lagi sebentar ya 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, lastSendTime, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  return (
    <div
      id="chat-window"
      className="fixed bottom-24 right-7 z-50 w-[320px] md:w-[360px] bg-white rounded-3xl shadow-2xl border border-[#e9f4f4] overflow-hidden animate-chatFadeIn"
      role="dialog"
      aria-label="KOJE24 Chat Assistant"
    >
      {/* HEADER */}
      <div className="bg-[#0FA3A8] text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            K
          </div>
          <div className="flex flex-col leading-tight">
            <p className="font-semibold text-sm">KOJE24 Assistant</p>
            <span className="text-[11px] text-emerald-100">Online • fast response</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(STORAGE_KEY);
            }
            onClose();
          }}
          className="hover:bg-white/10 rounded-full p-1 transition"
          aria-label="Tutup chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY */}
      <div ref={chatRef} className="p-4 h-[260px] overflow-y-auto bg-[#f8fcfc] space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex gap-2 max-w-[80%]">
              {m.from === "bot" && (
                <div className="mt-[2px] w-7 h-7 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center text-[11px] font-semibold text-[#0FA3A8]">
                  K
                </div>
              )}

              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.from === "user"
                    ? "bg-[#0FA3A8] text-white rounded-br-sm"
                    : "bg-white border border-[#e3f1f1] text-[#123]"
                }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center text-[11px] font-semibold text-[#0FA3A8]">
                K
              </div>
              <div className="px-3 py-2 rounded-2xl bg-white border border-[#e3f1f1] text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-flex gap-1">
                  <span className="dot dot-1" />
                  <span className="dot dot-2" />
                  <span className="dot dot-3" />
                </span>
                <span>Mengetik…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK REPLIES */}
      <div className="px-3 pb-2 pt-1 bg-[#f8fcfc] border-t border-[#e8f2f2] flex flex-wrap gap-2">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => handleQuickReply(q.text)}
            className="text-[11px] px-2.5 py-1 rounded-full border border-[#0FA3A8]/25 text-[#0FA3A8] bg-white hover:bg-[#0FA3A8]/5 transition"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <form onSubmit={handleSubmit} className="flex items-center p-3 bg-white border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan…"
          className="flex-1 border border-[#e3f1f1] rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0FA3A8]/60"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="ml-2 bg-[#0FA3A8] text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0c8c91] transition"
          aria-label="Kirim pesan"
        >
          <SendHorizonal size={18} />
        </button>
      </form>

      {/* ANIMATIONS */}
      <style jsx global>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        .animate-chatFadeIn { animation: chatFadeIn 0.24s ease-out; }
        
        @keyframes bubbleDots {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot {
          width: 6px; height: 6px; border-radius: 999px;
          background: #0FA3A8;
          animation: bubbleDots 1.2s infinite ease-in-out;
        }
        .dot-2 { animation-delay: 0.15s; }
        .dot-3 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
