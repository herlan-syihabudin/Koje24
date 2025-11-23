"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function KOJE24Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const path = usePathname();

  // Hanya tampil di halaman bantuan
  const isHelpPage = path.includes("bantuan");
  if (!isHelpPage) return null;

  // Auto reset setelah 2 menit tidak aktif
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      setMessages([]);
      setOpen(false);
    }, 120000); // 2 menit

    return () => clearTimeout(timer);
  }, [open, messages]);

  // Event dari halaman bantuan
  useEffect(() => {
    function handler(e: any) {
      const first = e.detail;
      setOpen(true);

      if (first) {
        sendMessage(first);
      }
    }

    window.addEventListener("open-koje24", handler);
    return () => window.removeEventListener("open-koje24", handler);
  }, []);

  async function sendMessage(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    const res = await fetch("/api/koje24-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...messages,
          { role: "user", content: text },
        ],
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);
  }

  return (
    <>
      {/* Floating Bubble */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 bg-[#0FA3A8] text-white px-4 py-2 rounded-full shadow-lg z-[9999]"
          onClick={() => {
            setMessages([]);
            setOpen(true);
          }}
        >
          KOJE24 Assistant
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-[9999]">
          <div className="w-full max-w-md bg-white rounded-t-2xl shadow-xl p-4 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[#0b4b50]">
                KOJE24 Assistant
              </h2>
              <button
                onClick={() => {
                  setMessages([]);
                  setOpen(false);
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat */}
            <div className="h-80 overflow-y-auto flex flex-col gap-3 p-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "self-end bg-[#0FA3A8] text-white px-3 py-2 rounded-lg max-w-[80%]"
                      : "self-start bg-[#f0fbfb] text-[#0b4b50] px-3 py-2 rounded-lg max-w-[80%]"
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                sendMessage(input);
                setInput("");
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border border-[#cdeaea] rounded-full px-4 py-2 text-sm"
                placeholder="Tulis pesan..."
              />
              <button
                type="submit"
                className="bg-[#0FA3A8] text-white px-4 py-2 rounded-full"
              >
                Kirim
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
