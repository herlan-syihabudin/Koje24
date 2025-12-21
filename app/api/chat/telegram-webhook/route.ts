import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
} from "@/lib/livechatStore";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

function extractSessionId(text?: string | null) {
  if (!text) return null;

  // 1️⃣ Format paling sering (baris sendiri)
  const m1 = text.match(/Session[:\s]*\n?([a-zA-Z0-9-]+)/i);
  if (m1?.[1]) return m1[1];

  // 2️⃣ Inline fallback
  const m2 = text.match(/Session[:\s]*([a-zA-Z0-9-]+)/i);
  if (m2?.[1]) return m2[1];

  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (SECRET) {
      const token = req.headers.get("x-telegram-bot-api-secret-token");
      if (token !== SECRET) return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    const msg = body.message;
    if (!msg) return NextResponse.json({ ok: true });

    // 🔒 hanya admin
    if (ADMIN_ID && msg.from?.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // ❗ admin WAJIB reply
    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption;

    if (!repliedText) {
      console.warn("ADMIN BALAS TANPA REPLY — DIABAIKAN");
      return NextResponse.json({ ok: true });
    }

    const sessionId = extractSessionId(repliedText);
    if (!sessionId) {
      console.warn("SESSION ID TIDAK DITEMUKAN");
      return NextResponse.json({ ok: true });
    }

    const text =
      msg.text?.trim() ||
      msg.caption?.trim();

    if (!text) return NextResponse.json({ ok: true });

    // ✅ SIMPAN PESAN
    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    // ✅ WAJIB AWAIT
    await setAdminActive();
    await setAdminTyping(5000);

    console.log("✅ ADMIN MESSAGE SAVED:", sessionId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ TELEGRAM WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true }); // Telegram wajib 200
  }
}
