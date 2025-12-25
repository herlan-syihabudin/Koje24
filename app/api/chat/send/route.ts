export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  isSessionClosed,
  initSession,
  getSessionStatus,
  setSessionStatus,
} from "@/lib/livechatStore";
import { enqueueChat, getQueueInfo } from "@/lib/chatQueue"; // ⬅️ TAMBAHAN

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

function esc(input: string) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name = "Guest",
      phone = "-",
      topic = "-",
      email = "-",
      message,
      sessionId,
      page = "-",
    } = body || {};

    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    /* =====================
       1️⃣ CEK CHAT DITUTUP
    ===================== */
    if (await isSessionClosed(sessionId)) {
      return NextResponse.json({
        ok: false,
        message: "Percakapan telah ditutup oleh admin",
      });
    }

    /* =====================
       2️⃣ INIT SESSION (AMAN)
    ===================== */
    await initSession(sessionId, {
      name,
      phone,
      topic,
      page,
      email,
    });

    /* =====================
       3️⃣ GREETING SERVER-SIDE
    ===================== */
    const status = await getSessionStatus(sessionId);
    if (status === "INIT") {
      await addMessage(sessionId, {
        role: "admin",
        text: `👋 Hai ${name || "kak"}, selamat datang di KOJE24 🌿

Aku admin KOJE24.
Silakan tulis pertanyaan kamu ya 😊`,
        ts: Date.now(),
      });

      await setSessionStatus(sessionId, "ACTIVE");
      await enqueueChat(sessionId); // masuk antrian
    }

    /* =====================
       4️⃣ SIMPAN PESAN USER
    ===================== */
    await addMessage(sessionId, {
      role: "user",
      text: message.trim(),
      ts: Date.now(),
    });

    /* =====================
       5️⃣ AMBIL INFO ANTRIAN
    ===================== */
    const queue = await getQueueInfo(sessionId);

    const queueText = queue.position
      ? `⏳ <b>Antrian:</b> ${queue.position} dari ${queue.total} user`
      : `🟢 <b>Status:</b> Tidak dalam antrian`;

    /* =====================
       6️⃣ KIRIM KE TELEGRAM
    ===================== */
    const text = `
📩 <b>LIVE CHAT WEBSITE - KOJE24</b>

👤 Nama: ${esc(name)}
📧 Email: ${esc(email)}
📱 HP: ${esc(phone)}
🏷️ Topik: ${esc(topic)}

${queueText}

🆔 Session:
<code>${esc(sessionId)}</code>

🌐 Page: ${esc(page)}

💬 <b>Pesan:</b>
${esc(message)}
    `.trim();

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          reply_markup: { force_reply: true },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("TELEGRAM SEND ERROR:", err);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT SEND ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
