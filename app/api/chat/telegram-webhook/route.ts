import { NextRequest, NextResponse } from "next/server";
import { addMessage, setAdminActive } from "@/lib/livechatStore";

const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";
const ADMIN_ID = Number(process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0");

/**
 * Ambil sessionId dari pesan Telegram yang direply admin
 * Support:
 * - `abc-123`
 * - Session: abc-123
 * - 🆔 Session abc-123
 */
function extractSessionId(text: string | undefined | null) {
  if (!text) return null;

  // 1️⃣ Backtick format: `abc-123`
  const m1 = text.match(/`([a-zA-Z0-9-]{6,})`/);
  if (m1?.[1]) return m1[1];

  // 2️⃣ Plain format: Session: abc-123
  const m2 = text.match(/Session:\s*([a-zA-Z0-9-]{6,})/i);
  if (m2?.[1]) return m2[1];

  // 3️⃣ Emoji format: 🆔 Session abc-123
  const m3 = text.match(/🆔\s*Session[:\s]*([a-zA-Z0-9-]{6,})/i);
  if (m3?.[1]) return m3[1];

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Optional security: secret token Telegram
    if (SECRET) {
      const token = req.headers.get("x-telegram-bot-api-secret-token");
      if (token !== SECRET) {
        return NextResponse.json({ ok: true });
      }
    }

    const body = await req.json();
    const msg = body?.message;
    if (!msg) return NextResponse.json({ ok: true });

    // 🔒 Hanya admin yang boleh balas
    if (ADMIN_ID && msg.from?.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // ❗ Admin WAJIB reply ke pesan user
    const repliedText: string | undefined =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption;

    if (!repliedText) {
      // bukan reply → abaikan
      return NextResponse.json({ ok: true });
    }

    // 🔍 Ambil sessionId dari pesan yang direply
    const sessionId = extractSessionId(repliedText);
    if (!sessionId) {
      console.warn("LIVECHAT: sessionId tidak ditemukan dari reply");
      return NextResponse.json({ ok: true });
    }

    // 💬 Ambil teks balasan admin
    const incomingText: string | null =
      msg.text?.trim() ||
      msg.caption?.trim() ||
      null;

    if (!incomingText) {
      // admin kirim sticker / voice / dll → abaikan
      return NextResponse.json({ ok: true });
    }

    // 💾 Simpan ke store
    await addMessage(sessionId, {
      role: "admin",
      text: incomingText,
      ts: Date.now(),
    });

    // 🟢 Update status admin aktif
    setAdminActive();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ LIVECHAT WEBHOOK ERROR:", err);
    // Telegram WAJIB terima 200
    return NextResponse.json({ ok: true });
  }
}
