// app/api/chat/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  initSession,
  getSessionStatus,
  setSessionStatus,
  addMessage,
} from "@/lib/livechatStore";
import { enqueueChat } from "@/lib/chatQueue";

export async function POST(req: NextRequest) {
  const { sessionId, name, page } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ ok: false });
  }

  await initSession(sessionId, {
    name,
    page,
  });

  const status = await getSessionStatus(sessionId);
  if (status === "INIT") {
    await addMessage(sessionId, {
      role: "admin",
      text: `👋 Hai ${name || "kak"}, selamat datang di KOJE24 🌿  
Aku admin KOJE24. Silakan tulis pertanyaan kamu ya 😊`,
      ts: Date.now(),
    });

    await setSessionStatus(sessionId, "ACTIVE");
    await enqueueChat(sessionId);
  }

  return NextResponse.json({ ok: true });
}
