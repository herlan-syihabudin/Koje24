export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
  getLastActiveSessionId,
} from "@/lib/livechatStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body?.message;

    if (!msg?.text) return NextResponse.json({ ok: true });

    const text = msg.text.trim();
    if (!text) return NextResponse.json({ ok: true });

    // 🔑 Ambil session user terakhir aktif
    const sessionId = await getLastActiveSessionId();

    if (!sessionId) {
      console.warn("⚠️ NO ACTIVE SESSION");
      return NextResponse.json({ ok: true });
    }

    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    await setAdminActive();
    await setAdminTyping(3000);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ TELEGRAM WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
