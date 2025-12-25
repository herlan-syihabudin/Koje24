export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
  getLastActiveSessionId,
} from "@/lib/livechatStore";

const ADMIN_USER_ID = Number(
  process.env.TELEGRAM_LIVECHAT_ADMIN_USER_ID || "0"
);

export async function POST(req: NextRequest) {
  console.log("🔥 TELEGRAM WEBHOOK HIT");

  try {
    const body = await req.json();
    const msg = body?.message;

    if (!msg) return NextResponse.json({ ok: true });

    console.log("👤 FROM:", msg.from?.id);

    // 🔒 VALIDASI ADMIN
    if (!ADMIN_USER_ID || msg.from?.id !== ADMIN_USER_ID) {
      console.log("⛔ NOT ADMIN");
      return NextResponse.json({ ok: true });
    }

    const text = msg.text?.trim();
    if (!text) return NextResponse.json({ ok: true });

    // ⭐ AMBIL SESSION AKTIF TERAKHIR
    const sessionId = await getLastActiveSessionId();

    console.log("🆔 LAST SESSION:", sessionId);

    if (!sessionId) {
      console.warn("⚠️ NO ACTIVE SESSION");
      return NextResponse.json({ ok: true });
    }

    // 💬 SIMPAN PESAN ADMIN
    await addMessage(sessionId, {
      role: "admin",
      text,
      ts: Date.now(),
    });

    await setAdminActive();
    await setAdminTyping(3000);

    console.log("✅ ADMIN MESSAGE SAVED");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ ok: true });
  }
}
