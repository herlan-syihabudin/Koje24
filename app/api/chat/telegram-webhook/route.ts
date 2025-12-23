import { NextRequest, NextResponse } from "next/server";
import { addMessage, setAdminActive, setAdminTyping } from "@/lib/livechatStore";

const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID || "0");

function extractSessionId(text?: string | null) {
  if (!text) return null;

  const m1 = text.match(/Session[:\s]*([a-zA-Z0-9-]+)/i);
  if (m1?.[1]) return m1[1].trim();

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body.message;
    if (!msg) return NextResponse.json({ ok: true });

    // 🔒 HANYA ADMIN
    if (ADMIN_ID && msg.from?.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // ❗ WAJIB REPLY
    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption;

    if (!repliedText) return NextResponse.json({ ok: true });

    const sessionId = extractSessionId(repliedText);
    if (!sessionId) return NextResponse.json({ ok: true });

    const text = msg.text?.trim();
    if (!text) return NextResponse.json({ ok: true });

    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    await setAdminActive();
    await setAdminTyping(5000);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
