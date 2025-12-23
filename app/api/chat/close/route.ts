import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { dequeueChat } from "@/lib/chatQueue";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // tandai closed
    await kv.hset(`chat:session:${sessionId}`, {
      state: "closed",
      closedAt: Date.now(),
    });

    // bebaskan admin
    await kv.del("admin:active");

    // ambil user berikutnya
    const nextSid = await dequeueChat();

    if (nextSid) {
      await kv.set("admin:active", nextSid);
      await kv.hset(`chat:session:${nextSid}`, { state: "active" });

      // kirim ke Telegram admin
      await fetch(`${process.env.APP_URL}/api/chat/telegram-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: nextSid }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("CHAT CLOSE ERROR:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
