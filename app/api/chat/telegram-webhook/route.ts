export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
} from "@/lib/livechatStore";

const ADMIN_USER_ID = Number(
  process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0"
);

function extractSessionId(text?: string | null) {
  if (!text) return null;

  const match =
    text.match(/Session[:\s]*\n?\s*([a-zA-Z0-9-]+)/i) ||
    text.match(/🆔\s*Session[:\s]*\n?\s*([a-zA-Z0-9-]+)/i);

  return match?.[1]?.trim() || null;
}

export async function POST(req: NextRequest) {
  console.log("🔥 TELEGRAM WEBHOOK HIT");

  try {
    const body = await req.json();
    console.log("📦 RAW BODY:", JSON.stringify(body));

    const msg = body?.message;
    if (!msg) return NextResponse.json({ ok: true });

    console.log("👤 FROM:", msg.from?.id);

    // 🔒 VALIDASI ADMIN (INI SAJA)
    if (!ADMIN_USER_ID || msg.from?.id !== ADMIN_USER_ID) {
      console.log("⛔ NOT ADMIN");
      return NextResponse.json({ ok: true });
    }

    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption;

    if (!repliedText) {
      console.log("⚠️ BUKAN REPLY");
      return NextResponse.json({ ok: true });
    }

    const sessionId = extractSessionId(repliedText);
    console.log("🆔 SESSION:", sessionId);

    if (!sessionId) return NextResponse.json({ ok: true });

    const text = msg.text?.trim();
    if (!text) return NextResponse.json({ ok: true });

    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    await setAdminActive();
    await setAdminTyping(3000);

    console.log("✅ ADMIN MESSAGE SAVED");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
