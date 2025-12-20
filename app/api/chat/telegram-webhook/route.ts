import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/livechatStore";
import { setAdminActive } from "@/lib/adminStatus";

let ACTIVE_SESSION: string | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* ===========================
       ADMIN KLIK TOMBOL
    ============================ */
    if (body.callback_query) {
      const data = body.callback_query.data;

      if (data?.startsWith("reply:")) {
        ACTIVE_SESSION = data.replace("reply:", "");

        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_LIVECHAT_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: body.callback_query.from.id,
              text: "✍️ Silakan ketik balasan untuk user ini",
            }),
          }
        );
      }

      return NextResponse.json({ ok: true });
    }

    /* ===========================
       ADMIN KETIK PESAN
    ============================ */
    if (body.message?.text && ACTIVE_SESSION) {
      await addMessage(ACTIVE_SESSION, {
        role: "admin",
        text: body.message.text.trim(),
        ts: Date.now(),
      });

      setAdminActive();
      ACTIVE_SESSION = null; // reset
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LIVECHAT WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
