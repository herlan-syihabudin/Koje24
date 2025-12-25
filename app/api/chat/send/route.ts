export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/livechatStore";

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
      message,
      sessionId,
      page = "-",
    } = body || {};

    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // ✅ 1️⃣ SIMPAN PESAN USER KE KV
    await addMessage(sessionId, {
      role: "user",
      text: message,
      ts: Date.now(),
    });

    // ✅ 2️⃣ KIRIM KE TELEGRAM
    const text = `
📩 <b>LIVE CHAT WEBSITE - KOJE24</b>

👤 Nama: ${esc(name)}
📱 HP: ${esc(phone)}
🏷️ Topik: ${esc(topic)}

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
          reply_markup: {
            force_reply: true,
          },
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
