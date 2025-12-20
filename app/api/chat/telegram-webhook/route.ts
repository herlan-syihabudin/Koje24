import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/livechatStore";
import { setAdminActive } from "@/lib/adminStatus";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;

// 🔐 simpan session PER ADMIN (AMAN)
const ACTIVE_SESSIONS = new Map<number, string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* ===========================
       ADMIN KLIK TOMBOL
    ============================ */
    if (body.callback_query) {
      const data = body.callback_query.data;
      const adminId = body.callback_query.from.id;

      if (data?.startsWith("reply:")) {
        const sessionId = data.replace("reply:", "");

        ACTIVE_SESSIONS.set(adminId, sessionId);

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminId,
            text: "✍️ Silakan ketik balasan untuk user ini",
          }),
        });
      }

      return NextResponse.json({ ok: true });
    }

    /* ===========================
       ADMIN KETIK PESAN
    ============================ */
    if (body.message?.text) {
      const adminId = body.message.from.id;
      const sessionId = ACTIVE_SESSIONS.get(adminId);

      // ❌ admin belum klik tombol
      if (!sessionId) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminId,
            text: "⚠️ Klik tombol *Balas Chat Ini* dulu sebelum membalas",
            parse_mode: "Markdown",
          }),
        });

        return NextResponse.json({ ok: true });
      }

      // ✅ simpan balasan admin ke web
      await addMessage(sessionId, {
        role: "admin",
        text: body.message.text.trim(),
        ts: Date.now(),
      });

      setAdminActive();
      ACTIVE_SESSIONS.delete(adminId); // reset session admin
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
