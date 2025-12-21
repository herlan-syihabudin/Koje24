import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
} from "@/lib/livechatStore";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

/**
 * Ambil sessionId dari pesan Telegram yang direply admin
 * Support:
 * - `abc-123`
 * - Session: abc-123
 * - 🆔 Session abc-123
 */
function extractSessionId(text?: string | null) {
  if (!text) return null;

  // 1️⃣ Backtick format
  const m1 = text.match(/`([a-zA-Z0-9-]{6,})`/);
  if (m1?.[1]) return m1[1];

  // 2️⃣ Plain format
  const m2 = text.match(/Session:\s*([a-zA-Z0-9-]{6,})/i);
  if (m2?.[1]) return m2[1];

  // 3️⃣ Emoji format
  const m3 = text.match(/🆔\s*Session[:\s]*([a-zA-Z0-9-]{6,})/i);
  if (m3?.[1]) return m3[1];

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Optional security: Telegram secret token
    if (SECRET) {
      const token = req.headers.get("x-telegram-bot-api-secret-token");
      if (token !== SECRET) {
        return NextResponse.json({ ok: true });
      }
    }

    const body = await req.json();
    const msg = body?.message;
    if (!msg) return NextResponse.json({ ok: true });

    // 🔒 Pastikan hanya admin
    if (ADMIN_ID && msg.from?.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // ❗ WAJIB reply ke pesan user
    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption;

    if (!repliedText) {
      return NextResponse.json({ ok: true });
    }

    // 🔍 Ambil sessionId
    const sessionId = extractSessionId(repliedText);
    if (!sessionId) {
      console.warn("LIVECHAT: sessionId tidak ditemukan dari reply");
      return NextResponse.json({ ok: true });
    }

    // 💬 Ambil teks balasan admin
    const incomingText =
      msg.text?.trim() ||
      msg.caption?.trim() ||
      null;

    if (!incomingText) {
      // sticker / voice / dll → abaikan
      return NextResponse.json({ ok: true });
    }

    // ✍️ Admin sedang mengetik (typing indicator ON)
    setAdminTyping(5000);

    // 💾 Simpan pesan admin
    await addMessage(sessionId, {
      role: "admin",
      text: incomingText,
      ts: Date.now(),
    });

    // 🟢 Update admin aktif
    setAdminActive();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ LIVECHAT WEBHOOK ERROR:", err);
    // Telegram wajib terima 200
    return NextResponse.json({ ok: true });
  }
}
