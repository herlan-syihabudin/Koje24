"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

type UserData = {
  name: string;
  phone: string;
  topic: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userData, setUserData] = useState<UserData>({
    name: "",
    phone: "",
    topic: "Produk",
  });

  /* ===========================
     STABLE SESSION ID
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

  /* ===========================
     OPEN FROM HEADER EVENT
  ============================ */
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-chat", openHandler);
    return () => window.removeEventListener("open-chat", openHandler);
  }, []);

  /* ===========================
     PREFILL DATA (JIKA ADA)
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
     START CHAT (SUBMIT FORM)
  ============================ */
  const startChat = () => {
    if (!userData.name.trim()) {
      setErrorMsg("Nama wajib diisi 🙏");
      return;
    }
    setErrorMsg("");
    localStorage.setItem("chat_user_data", JSON.stringify(userData));
    setStep("chat");
  };

  /* ===========================
     SEND CHAT → API → TELEGRAM
  ============================ */
  const send = async () => {
    if (!msg.trim() || sending) return;

    setSending(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          message: msg,
          sessionId: getSessionId(),
          page: window.location.pathname,
        }),
      });

      if (!res.ok) throw new Error("Send failed");

      setMsg("");
    } catch (error) {
      console.error("CHAT SEND ERROR:", error);
      setErrorMsg("Gagal mengirim pesan. Coba lagi ya 🙏");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* ===========================
          FLOATING BUTTON
      ============================ */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[998] bg-[#0FA3A8] text-white p-4 rounded-full shadow-lg hover:bg-[#0B4B50]"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* ===========================
          CHAT MODAL
      ============================ */}
      {open && (
        <div className="fixed inset-0 z-[999] bg-black/40 flex items-end md:items-center justify-center">
          <div className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 font-semibold">
                <MessageCircle size={18} /> Chat Admin KOJE24
              </div>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600 mb-2">{errorMsg}</div>
            )}

            {/* ===========================
                STEP 1 — FORM IDENTITAS
            ============================ */}
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

            {/* ===========================
                STEP 2 — CHAT INPUT
            ============================ */}
            {step === "chat" && (
              <>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Tulis pertanyaan kamu..."
                  className="w-full border rounded p-2 text-sm"
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
      )}
    </>
  );
}
