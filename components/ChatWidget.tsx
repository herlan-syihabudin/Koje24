"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-chat", openHandler);
    return () => window.removeEventListener("open-chat", openHandler);
  }, []);

  const send = async () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Guest",
          message: msg,
          page: window.location.pathname,
        }),
      });
      setMsg("");
      alert("Pesan terkirim ke admin");
    } catch {
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-end md:items-center justify-center">
      <div className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 font-semibold">
            <MessageCircle size={18} /> Chat Admin KOJE24
          </div>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Tulis pertanyaan kamu..."
          className="w-full border rounded p-2 text-sm"
          rows={3}
        />

        <button
          onClick={send}
          disabled={sending}
          className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded hover:bg-[#0B4B50] disabled:opacity-50"
        >
          {sending ? "Mengirim..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}
