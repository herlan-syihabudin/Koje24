import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/livechatStore";
import { setAdminActive } from "@/lib/adminStatus";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

function extractSessionId(text: string) {
  const match = text.match(/Session:\s*([^\n]+)/i);
  return match?.[1]?.trim() || "";
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 webhook security
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

    // admin WAJIB reply ke pesan bot
    const repliedText = msg.reply_to_message?.text;
    if (!repliedText) return NextResponse.json({ ok: true });

    const sessionId = extractSessionId(repliedText);
    if (!sessionId) return NextResponse.json({ ok: true });

    // simpan pesan ADMIN
    await addMessage(sessionId, {
      role: "admin",
      text: msg.text.trim(),
      ts: Date.now(),
    });

    // 🔥 tandai admin aktif
    setAdminActive();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
