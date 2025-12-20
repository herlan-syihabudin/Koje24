import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/livechatStore";
import { setAdminActive } from "@/lib/adminStatus";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

function extractSessionId(text: string) {
  const match = text.match(/Session:\s*([a-zA-Z0-9-]+)/);
  return match?.[1] || null;
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 optional security
    if (SECRET) {
      const token = req.headers.get("x-telegram-bot-api-secret-token");
      if (token !== SECRET) return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    const msg = body?.message;
    if (!msg?.text) return NextResponse.json({ ok: true });

    // hanya admin
    if (ADMIN_ID && msg.from.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // ❗ WAJIB reply
    const replied = msg.reply_to_message?.text;
    if (!replied) {
      return NextResponse.json({ ok: true });
    }

    const sessionId = extractSessionId(replied);
    if (!sessionId) return NextResponse.json({ ok: true });

    await addMessage(sessionId, {
      role: "admin",
      text: msg.text.trim(),
      ts: Date.now(),
    });

    setAdminActive();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
