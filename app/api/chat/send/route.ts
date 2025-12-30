export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  isSessionClosed,
  initSession,
} from "@/lib/livechatStore";
import { getQueueInfo } from "@/lib/chatQueue";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

/* =====================
   ESCAPE HTML (TELEGRAM SAFE)
===================== */
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

    /* =====================
       VALIDASI DASAR
    ===================== */
    if (!sessionId || !message?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Payload tidak valid" },
        { status: 400 }
      );
    }

    /* =====================
       BLOKIR JIKA CHAT CLOSED
    ===================== */
    const closed = await isSessionClosed(sessionId);
    if (closed) {
      return NextResponse.json({
        ok: false,
        closed: true,
        message: "Percakapan telah ditutup oleh admin",
      });
    }

    /* =====================
       INIT SESSION (IDEMPOTENT)
       ❗ TIDAK ADA GREETING DI SINI
    ===================== */
    await initSession(sessionId, {
      name,
      phone,
      topic,
      page,
      email,
    });

    /* =====================
       SIMPAN PESAN USER (SATU-SATUNYA)
    ===================== */
    const userMsg = await addMessage(sessionId, {
      role: "user",
      text: message.trim(),
      ts: Date.now(),
    });

    /* =====================
       INFO ANTRIAN (OPTIONAL)
    ===================== */
    let queueText = "";
    try {
      const queue = await getQueueInfo(sessionId);
      if (queue?.position && queue.position > 0) {
        queueText = `⏳ <b>Antrian:</b> ${queue.position} dari ${queue.total} user`;
      } else {
        queueText = `🟢 <b>Status:</b> Tidak dalam antrian`;
      }
    } catch {
      queueText = "";
    }

    /* =====================
       FORMAT PESAN TELEGRAM
    ===================== */
    const telegramText = `
📩 <b>LIVE CHAT WEBSITE - KOJE24</b>

👤 Nama: ${esc(name)}
📧 Email: ${esc(email)}
📱 HP: ${esc(phone)}
🏷️ Topik: ${esc(topic)}

${queueText}

🆔 Session:
<code>${esc(sessionId)}</code>

🌐 Page:
${esc(page)}

💬 <b>Pesan:</b>
${esc(userMsg.text)}
    `.trim();

    /* =====================
       KIRIM KE TELEGRAM
    ===================== */
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramText,
          parse_mode: "HTML",
          reply_markup: { force_reply: true },
        }),
      }
    );

    if (!tgRes.ok) {
      const err = await tgRes.text();
      console.error("TELEGRAM SEND ERROR:", err);
      return NextResponse.json(
        { ok: false, message: "Gagal kirim ke Telegram" },
        { status: 500 }
      );
    }

    /* =====================
       SUCCESS
    ===================== */
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT SEND ERROR:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
