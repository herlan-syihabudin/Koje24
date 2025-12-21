import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
} from "@/lib/livechatStore";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

// simpan session aktif dari callback button
let activeSessionFromButton: string | null = null;

function extractSessionId(text?: string | null) {
  if (!text) return null;

  const m1 = text.match(/`([a-zA-Z0-9-]{6,})`/);
  if (m1?.[1]) return m1[1];

  const m2 = text.match(/Session[:\s]*([a-zA-Z0-9-]{6,})/i);
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

    // ===============================
    // 1️⃣ HANDLE INLINE BUTTON
    // ===============================
    if (body.callback_query) {
      const cq = body.callback_query;
      if (ADMIN_ID && cq.from?.id !== ADMIN_ID) {
        return NextResponse.json({ ok: true });
      }

      const data: string = cq.data || "";
      if (data.startsWith("reply:")) {
        activeSessionFromButton = data.replace("reply:", "");
      }

      return NextResponse.json({ ok: true });
    }

    // ===============================
    // 2️⃣ HANDLE MESSAGE
    // ===============================
    const msg = body.message;
    if (!msg) return NextResponse.json({ ok: true });

    if (ADMIN_ID && msg.from?.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    let sessionId: string | null = null;

    // a) reply manual
    if (msg.reply_to_message?.text) {
      sessionId = extractSessionId(msg.reply_to_message.text);
    }

    // b) fallback dari inline button
    if (!sessionId && activeSessionFromButton) {
      sessionId = activeSessionFromButton;
    }

    if (!sessionId) {
      console.warn("LIVECHAT: sessionId tidak ditemukan");
      return NextResponse.json({ ok: true });
    }

    const text =
      msg.text?.trim() ||
      msg.caption?.trim() ||
      null;

    if (!text) return NextResponse.json({ ok: true });

    setAdminTyping(5000);

    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    setAdminActive();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ TELEGRAM WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
