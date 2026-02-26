"use client";

import { useEffect, useRef, useState, useCallback, useReducer } from "react";
import { X } from "lucide-react";

// Types
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

type ChatState = {
  open: boolean;
  step: "form" | "chat";
  userData: UserData;
  messages: ChatMessage[];
  adminOnline: boolean;
  adminTyping: boolean;
  sending: boolean;
  closed: boolean;
  sid: string;
  error: string | null;
};

type ChatAction =
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "SET_STEP"; payload: "form" | "chat" }
  | { type: "UPDATE_USER"; payload: Partial<UserData> }
  | { type: "ADD_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_ADMIN_STATUS"; payload: { online: boolean; typing: boolean } }
  | { type: "SET_CLOSED"; payload: boolean }
  | { type: "SET_SENDING"; payload: boolean }
  | { type: "SET_SID"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_CHAT" };

const initialState: ChatState = {
  open: false,
  step: "form",
  userData: { name: "", phone: "", topic: "Produk" },
  messages: [],
  adminOnline: false,
  adminTyping: false,
  sending: false,
  closed: false,
  sid: "",
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, open: action.payload };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "UPDATE_USER":
      return { ...state, userData: { ...state.userData, ...action.payload } };
    case "ADD_MESSAGES":
      return {
        ...state,
        messages: [...state.messages, ...action.payload]
          .filter((m, i, arr) => arr.findIndex(m2 => m2.id === m.id) === i) // unique
          .sort((a, b) => a.ts - b.ts),
      };
    case "SET_ADMIN_STATUS":
      return {
        ...state,
        adminOnline: action.payload.online,
        adminTyping: action.payload.typing,
      };
    case "SET_CLOSED":
      return { ...state, closed: action.payload };
    case "SET_SENDING":
      return { ...state, sending: action.payload };
    case "SET_SID":
      return { ...state, sid: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET_CHAT":
      return {
        ...initialState,
        sid: state.sid, // retain sid
        open: state.open,
      };
    default:
      return state;
  }
}

const POLL_INTERVAL = 3000; // naikkin dikit biar gak terlalu berat
const MAX_RETRIES = 3;

// Safe UUID generator dengan fallback
const generateUUID = () => {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback untuk non-HTTPS / browser lama
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ChatWidget() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [msg, setMsg] = useState("");
  const [pollRetries, setPollRetries] = useState(0);

  const lastTsRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init session
  useEffect(() => {
    let storedSid = localStorage.getItem("chat_session_id");
    if (!storedSid) {
      storedSid = generateUUID();
      localStorage.setItem("chat_session_id", storedSid);
    }
    dispatch({ type: "SET_SID", payload: storedSid });
  }, []);

  // Event listeners
  useEffect(() => {
    const openEvent = () => dispatch({ type: "SET_OPEN", payload: true });
    const closeEvent = () => dispatch({ type: "SET_OPEN", payload: false });

    window.addEventListener("open-chat", openEvent);
    window.addEventListener("close-chat", closeEvent);

    return () => {
      window.removeEventListener("open-chat", openEvent);
      window.removeEventListener("close-chat", closeEvent);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.adminTyping, state.closed]);

  // Polling dengan AbortController
  useEffect(() => {
  if (!state.open || state.step !== "chat" || !state.sid) return;

  const poll = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(
        `/api/chat/poll?sid=${state.sid}&after=${lastTsRef.current}`,
        {
          signal: controller.signal,
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data?.ok) throw new Error("Invalid response");

      dispatch({
        type: "SET_ADMIN_STATUS",
        payload: { online: !!data.adminOnline, typing: !!data.adminTyping },
      });

      dispatch({ type: "SET_CLOSED", payload: !!data.closed });
      setPollRetries(0);

      if (Array.isArray(data.messages) && data.messages.length) {
        dispatch({ type: "ADD_MESSAGES", payload: data.messages });
        lastTsRef.current = Math.max(
          lastTsRef.current,
          ...data.messages.map((m: ChatMessage) => m.ts)
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;

      console.error("Polling error:", err);

      setPollRetries((prev) => {
        const next = prev + 1;

        if (next >= MAX_RETRIES) {
          dispatch({
            type: "SET_ERROR",
            payload: "Koneksi terputus. Menghubungkan kembali...",
          });
        }

        return next;
      });
    }
  };

  pollingIntervalRef.current = setInterval(poll, POLL_INTERVAL);
  poll();

  return () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, [state.open, state.step, state.sid, pollRetries]);

  // Validasi form
  const validateForm = useCallback(() => {
    if (!state.userData.name.trim()) {
      dispatch({ type: "SET_ERROR", payload: "Nama harus diisi" });
      return false;
    }
    if (state.userData.phone && !/^[0-9+\-\s]{10,15}$/.test(state.userData.phone)) {
      dispatch({ type: "SET_ERROR", payload: "Nomor telepon tidak valid" });
      return false;
    }
    return true;
  }, [state.userData]);

  // Start chat
  const startChat = async () => {
    if (!validateForm()) return;
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sid,
          name: state.userData.name,
          phone: state.userData.phone,
          topic: state.userData.topic,
          page: window.location.pathname,
        }),
      });

      if (!res.ok) throw new Error("Failed to start chat");
      
      dispatch({ type: "SET_STEP", payload: "chat" });
      dispatch({ type: "SET_CLOSED", payload: false });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Gagal memulai chat" });
    }
  };

  // Send message
  const send = async () => {
    if (!msg.trim() || state.sending || state.closed) return;

    const text = msg.trim();
    const ts = Date.now();
    const tempId = `temp_${ts}_${Math.random()}`;

    // Optimistic update
    dispatch({
      type: "ADD_MESSAGES",
      payload: [{
        id: tempId,
        sid: state.sid,
        role: "user",
        text,
        ts,
      }],
    });

    lastTsRef.current = ts;
    setMsg("");
    dispatch({ type: "SET_SENDING", payload: true });

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state.userData,
          message: text,
          sessionId: state.sid,
          page: window.location.pathname,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
    } catch (err) {
      // Remove optimistic message on error
      dispatch({
        type: "ADD_MESSAGES",
        payload: state.messages.filter(m => m.id !== tempId),
      });
      dispatch({ type: "SET_ERROR", payload: "Gagal mengirim pesan" });
    } finally {
      dispatch({ type: "SET_SENDING", payload: false });
    }
  };

  // Start new session
  const startNewSession = async () => {
    const newSid = generateUUID();
    localStorage.setItem("chat_session_id", newSid);
    
    dispatch({ type: "RESET_CHAT" });
    dispatch({ type: "SET_SID", payload: newSid });
    dispatch({ type: "SET_STEP", payload: "chat" });
    dispatch({ type: "SET_CLOSED", payload: false });
    
    lastTsRef.current = 0;
    setMsg("");

    try {
      await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSid,
          name: state.userData.name || "Guest",
          phone: state.userData.phone,
          topic: state.userData.topic,
          page: window.location.pathname,
        }),
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Gagal memulai sesi baru" });
    }
  };

  if (!state.open) return null;

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
      role="dialog"
      aria-label="Live Chat KOJE24"
    >
      {/* HEADER */}
      <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">Live Chat KOJE24</div>
          <div className="text-xs text-gray-500">
            {state.adminOnline ? "🟢 Admin online" : "⚪ Admin offline"}
          </div>
        </div>
        <button 
          onClick={() => dispatch({ type: "SET_OPEN", payload: false })}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Tutup chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {state.error && (
        <div className="bg-red-50 text-red-600 text-xs px-4 py-2 border-b">
          {state.error}
        </div>
      )}

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#fafafa]">
        {state.step === "form" ? (
          <>
            <p className="text-sm text-gray-600">
              👋 Hai! Sebelum mulai, isi data diri dulu ya
            </p>
            <input
              placeholder="Nama *"
              value={state.userData.name}
              onChange={(e) =>
                dispatch({ type: "UPDATE_USER", payload: { name: e.target.value } })
              }
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0FA3A8]/30"
              aria-label="Nama"
            />
            <input
              placeholder="Nomor WhatsApp (opsional)"
              value={state.userData.phone}
              onChange={(e) =>
                dispatch({ type: "UPDATE_USER", payload: { phone: e.target.value } })
              }
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0FA3A8]/30"
              aria-label="Nomor telepon"
            />
            <select
              value={state.userData.topic}
              onChange={(e) =>
                dispatch({ type: "UPDATE_USER", payload: { topic: e.target.value } })
              }
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0FA3A8]/30"
              aria-label="Topik"
            >
              <option value="Produk">Produk</option>
              <option value="Pengiriman">Pengiriman</option>
              <option value="Pembayaran">Pembayaran</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <button
              onClick={startChat}
              className="w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#0B4B50] transition-colors disabled:opacity-50"
              disabled={!state.userData.name.trim()}
            >
              Mulai Chat
            </button>
          </>
        ) : (
          <>
            {state.messages.map((m) => (
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
                  {m.id.startsWith('temp_') && (
                    <span className="text-[10px] opacity-70 ml-2">⏳</span>
                  )}
                </div>
              </div>
            ))}

            {state.adminTyping && !state.closed && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {state.closed && (
              <div className="mt-4 bg-white border rounded-xl p-4 text-center text-sm">
                <div className="mb-1 font-medium">
                  🙏 Chat ini telah ditutup
                </div>
                <div className="text-gray-500 mb-3">
                  Kamu bisa mulai chat baru jika masih ada pertanyaan
                </div>
                <button
                  onClick={startNewSession}
                  className="w-full bg-[#0FA3A8] hover:bg-[#0B4B50] transition text-white py-2 rounded-xl font-medium"
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
      {state.step === "chat" && !state.closed && (
        <div className="sticky bottom-0 bg-white border-t p-3">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Tulis pesan… (Enter untuk kirim)"
            className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#0FA3A8]/30"
            disabled={state.sending}
          />
          <button
            onClick={send}
            disabled={!msg.trim() || state.sending}
            className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#0B4B50] transition-colors"
          >
            {state.sending ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      )}
    </div>
  );
}
