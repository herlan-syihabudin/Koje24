import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
} from "@/lib/livechatStore";

// 🔐 OPTIONAL SECURITY
const SECRET = process.env.TELEGRAM_LIVECHAT_WEBHOOK_SECRET || "";

// ✅ FIX UTAMA — SESUAI ENV YANG ADA DI VERCEL
const ADMIN_ID = Number(
  process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID || "0"
);

/**
 * Ambil sessionId dari pesan Telegram yang direply admin
 * SUPPORT:
 * - <code>SESSION_ID</code>
 * - Session:\nSESSION_ID
 * - Session: SESSION_ID
 */
function extractSessionId(text?: string | null) {
  if (!text) return null;

  // FORMAT PALING AMAN (HTML code block)
  const m0 = text.match(/<code>([^<]+)<\/code>/i);
  if (m0?.[1]) return m0[1].trim();

  // format multiline
  const m1 = text.match(/Session[:\s]*\n?([a-zA-Z0-9-]+)/i);
  if (m1?.[1]) return m1[1].trim();

  // inline fallback
  const m2 = text.match(/Session[:\s]*([a-zA-Z0-9-]+)/i);
  if (m2?.[1]) return m2[1].trim();

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 VALIDASI SECRET (JIKA DIPAKAI)
    if (SECRET) {
      const token = req.headers.get("x-telegram-bot-api-secret-token");
      if (token !== SECRET) {
        return NextResponse.json({ ok: true });
      }
    }

    const body = await req.json();
    const msg = body.message;
    if (!msg) return NextResponse.json({ ok: true });

    // 🧪 DEBUG PENTING (BOLEH DIHAPUS SETELAH FIX)
    console.log("ADMIN_ID:", ADMIN_ID);
    console.log("FROM_ID:", msg.from?.id);
    console.log("HAS_REPLY:", Boolean(msg.reply_to_message));

    // 🔒 HANYA ADMIN YANG BOLEH MASUK
    if (ADMIN_ID && msg.from?.id !== ADMIN_ID) {
      return NextResponse.json({ ok: true });
    }

    // ❗ ADMIN WAJIB REPLY KE PESAN BOT
    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption;

    if (!repliedText) {
      console.warn("❌ ADMIN BALAS TANPA REPLY — DIABAIKAN");
      return NextResponse.json({ ok: true });
    }

    const sessionId = extractSessionId(repliedText);

    console.log("📩 RAW REPLY TEXT:", repliedText);
    console.log("🆔 EXTRACTED SESSION:", sessionId);

    if (!sessionId) {
      console.warn("❌ SESSION ID TIDAK DITEMUKAN");
      return NextResponse.json({ ok: true });
    }

    const text =
      msg.text?.trim() ||
      msg.caption?.trim();

    if (!text) return NextResponse.json({ ok: true });

    // 💾 SIMPAN PESAN ADMIN KE KV
    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    // 🟢 UPDATE STATUS ADMIN
    await setAdminActive();
    await setAdminTyping(5000);

    console.log("✅ ADMIN MESSAGE SAVED:", sessionId);

    // ⚠️ TELEGRAM WAJIB TERIMA HTTP 200
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ TELEGRAM WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
