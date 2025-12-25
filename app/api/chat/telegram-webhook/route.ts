import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
} from "@/lib/livechatStore";

/**
 * ENV WAJIB:
 * TELEGRAM_LIVECHAT_ADMIN_USER_ID = USER_ID admin (contoh: 7635901950)
 * TELEGRAM_LIVECHAT_ADMIN_CHAT_ID = CHAT_ID tujuan bot kirim pesan
 */

const ADMIN_USER_ID = Number(
  process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0"
);

const ADMIN_CHAT_ID = String(
  process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID || ""
);

/**
 * Ambil sessionId dari pesan bot yang di-reply admin
 * Aman untuk newline / code block / emoji
 */
function extractSessionId(text?: string | null) {
  if (!text) return null;

  const match =
    text.match(/Session[:\s]*\n?\s*([a-zA-Z0-9-]+)/i) ||
    text.match(/🆔\s*Session[:\s]*\n?\s*([a-zA-Z0-9-]+)/i);

  return match?.[1]?.trim() || null;
}

export async function POST(req: NextRequest) {
  // 🔥 DEBUG PALING ATAS
  console.log("🔥 TELEGRAM WEBHOOK HIT");

  try {
    const body = await req.json();
    console.log("📦 RAW BODY:", JSON.stringify(body));

    const msg = body?.message;
    console.log("💬 MESSAGE FIELD:", msg);

    if (!msg) {
      console.log("⚠️ NO MESSAGE OBJECT");
      return NextResponse.json({ ok: true });
    }

    console.log("👤 FROM ID:", msg.from?.id);
    console.log("💬 CHAT ID:", msg.chat?.id);

    /**
     * 🔒 VALIDASI ADMIN (USER ID)
     */
    if (!ADMIN_USER_ID || msg.from?.id !== ADMIN_USER_ID) {
      console.log("⛔ NOT ADMIN USER");
      return NextResponse.json({ ok: true });
    }

    /**
     * 🔒 VALIDASI CHAT ID (OPSIONAL)
     */
    if (ADMIN_CHAT_ID && String(msg.chat?.id) !== ADMIN_CHAT_ID) {
      console.log("⛔ CHAT ID TIDAK COCOK");
      return NextResponse.json({ ok: true });
    }

    /**
     * ❗ HARUS REPLY PESAN BOT
     */
    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption ||
      null;

    console.log("↩️ REPLIED TEXT:", repliedText);

    if (!repliedText) {
      console.log("⚠️ BUKAN REPLY KE PESAN BOT");
      return NextResponse.json({ ok: true });
    }

    /**
     * 🎯 EXTRACT SESSION ID
     */
    const sessionId = extractSessionId(repliedText);
    console.log("🆔 SESSION ID:", sessionId);

    if (!sessionId) {
      console.warn("⚠️ SESSION ID TIDAK DITEMUKAN");
      return NextResponse.json({ ok: true });
    }

    /**
     * 💬 PESAN ADMIN
     */
    const text = msg.text?.trim();
    console.log("✍️ ADMIN TEXT:", text);

    if (!text) {
      console.log("⚠️ PESAN ADMIN KOSONG");
      return NextResponse.json({ ok: true });
    }

    /**
     * 🧠 SIMPAN PESAN ADMIN
     */
    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    console.log("✅ MESSAGE SAVED TO KV");

    /**
     * 🟢 UPDATE STATUS ADMIN
     */
    await setAdminActive();
    await setAdminTyping(3000);

    console.log("🟢 ADMIN STATUS UPDATED");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ TELEGRAM WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
