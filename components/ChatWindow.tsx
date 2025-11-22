"use client";

import { useEffect, useRef, useState } from "react";
import { X, SendHorizonal } from "lucide-react";

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Halo! Ada yang bisa saya bantu? 😊" },
  ]);
  const [input, setInput] = useState("");

  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMsg = () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Terima kasih! Admin KOJE24 akan segera membantu 😊" },
      ]);
    }, 500);
  };

  return (
    <div
      id="chat-window"
      className="fixed bottom-24 right-7 z-50 w-[320px] md:w-[360px] bg-white rounded-3xl shadow-2xl border border-[#e9f4f4] overflow-hidden animate-chatFadeIn"
    >
      {/* Header */}
      <div className="bg-[#0FA3A8] text-white px-4 py-3 flex justify-between items-center">
        <p className="font-semibold">KOJE24 Assistant</p>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Chat Body */}
      <div ref={chatRef} className="p-4 h-[260px] overflow-y-auto bg-[#f8fcfc]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm ${
                m.from === "user"
                  ? "bg-[#0FA3A8] text-white"
                  : "bg-white border"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center p-3 bg-white border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan…"
          className="flex-1 border rounded-full px-3 py-2 text-sm"
        />
        <button
          onClick={sendMsg}
          className="ml-2 bg-[#0FA3A8] text-white p-2 rounded-full"
        >
          <SendHorizonal size={18} />
        </button>
      </div>

      {/* Animasi aman */}
      <style jsx global>{`
        @keyframes chatFadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}
