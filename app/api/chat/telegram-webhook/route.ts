import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
  getLastActiveSessionId,
  closeSession, // 🔴 WAJIB
} from "@/lib/livechatStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body?.message;

    if (!msg?.text) return NextResponse.json({ ok: true });

    const text = msg.text.trim();
    if (!text) return NextResponse.json({ ok: true });

    const sessionId = await getLastActiveSessionId();
    if (!sessionId) return NextResponse.json({ ok: true });

    // 🔒 PERINTAH TUTUP CHAT
    if (text.toLowerCase() === "/tutup") {
      await closeSession(sessionId);

      await addMessage(sessionId, {
        role: "admin",
        text: "Percakapan telah ditutup oleh admin 🙏",
        ts: Date.now(),
      });

      return NextResponse.json({ ok: true });
    }

    // 💬 PESAN BIASA
    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    await setAdminActive();
    await setAdminTyping(3000);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
