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
  try {
    const body = await req.json();
    const msg = body?.message;

    if (!msg) return NextResponse.json({ ok: true });

    /**
     * 🔒 VALIDASI ADMIN (PALING PENTING)
     * HANYA USER_ID ADMIN yang boleh reply
     */
    if (!ADMIN_USER_ID || msg.from?.id !== ADMIN_USER_ID) {
      return NextResponse.json({ ok: true });
    }

    /**
     * 🔒 OPTIONAL: pastikan dari chat yang benar
     */
    if (ADMIN_CHAT_ID && String(msg.chat?.id) !== ADMIN_CHAT_ID) {
      return NextResponse.json({ ok: true });
    }

    /**
     * ❗ ADMIN HARUS REPLY PESAN BOT
     */
    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption ||
      null;

    if (!repliedText) {
      return NextResponse.json({ ok: true });
    }

    /**
     * 🎯 Ambil sessionId
     */
    const sessionId = extractSessionId(repliedText);
    if (!sessionId) {
      console.warn("LIVECHAT: sessionId tidak ditemukan");
      return NextResponse.json({ ok: true });
    }

    /**
     * 💬 Pesan admin
     */
    const text = msg.text?.trim();
    if (!text) {
      return NextResponse.json({ ok: true });
    }

    /**
     * 🧠 Simpan pesan admin
     */
    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    /**
     * 🟢 Update status admin
     */
    await setAdminActive();
    await setAdminTyping(3000);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("TELEGRAM WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
