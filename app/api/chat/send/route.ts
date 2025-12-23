import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { enqueueChat } from "@/lib/chatQueue";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, name, phone, topic, message, page } = body;

    if (!sessionId || !message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // simpan session info
    await kv.hset(`chat:session:${sessionId}`, {
      name,
      phone,
      topic,
      page,
      state: "waiting",
      createdAt: Date.now(),
    });

    // simpan pesan user
    await kv.rpush(`chat:${sessionId}`, {
      id: `u_${Date.now()}`,
      sid: sessionId,
      role: "user",
      text: message,
      ts: Date.now(),
    });

    const activeSid = await kv.get<string>("admin:active");

    // jika admin kosong → langsung ACTIVE
    if (!activeSid) {
      await kv.set("admin:active", sessionId);
      await kv.hset(`chat:session:${sessionId}`, { state: "active" });

      // 🔔 kirim ke Telegram admin
      await fetch(`${process.env.APP_URL}/api/chat/telegram-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } else {
      // admin sibuk → masuk antrian
      await enqueueChat(sessionId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("CHAT SEND ERROR:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
