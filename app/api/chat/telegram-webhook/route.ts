import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/livechatStore";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

function extractSessionId(text: string) {
  const match = text.match(/Session:\s*([^\n]+)/i);
  return match?.[1]?.trim() || "";
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 security webhook (optional tapi recommended)
    if (SECRET) {
      const incomingSecret =
        req.headers.get("x-telegram-bot-api-secret-token") || "";
      if (incomingSecret !== SECRET) {
        return NextResponse.json({ ok: true });
      }
    }

    const body = await req.json();
    const msg = body?.message;
    if (!msg?.text) return NextResponse.json({ ok: true });

    // hanya admin
    if (ADMIN_ID && Number(msg.from?.id) !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // WAJIB reply ke pesan bot (yg ada Session)
    const repliedText = msg.reply_to_message?.text;
    if (!repliedText) return NextResponse.json({ ok: true });

    const sessionId = extractSessionId(repliedText);
    if (!sessionId) return NextResponse.json({ ok: true });

    // simpan pesan admin
    await addMessage(sessionId, {
      role: "admin",
      text: msg.text.trim(),
      ts: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT WEBHOOK ERROR:", err);
    // jangan bikin telegram retry
    return NextResponse.json({ ok: true });
  }
}
