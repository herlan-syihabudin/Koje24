export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
  getLastActiveSessionId,
  closeSession,
  getAdminActiveSession,
  setAdminActiveSession,
  clearAdminActiveSession,
} from "@/lib/livechatStore";

import { dequeueChat, removeFromQueue } from "@/lib/chatQueue";

async function resolveSessionForAdminReply() {
  // 1) kalau admin sudah pegang 1 sid → pakai itu
  const active = await getAdminActiveSession();
  if (active) return active;

  // 2) kalau belum, ambil dari queue (FIFO)
  const fromQueue = await dequeueChat();
  if (fromQueue) {
    await setAdminActiveSession(fromQueue);
    return fromQueue;
  }

  // 3) fallback: biar sistem lama tetap jalan
  return await getLastActiveSessionId();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body?.message;

    // ❌ BUKAN PESAN TEKS
    if (!msg?.text) return NextResponse.json({ ok: true });

    const textRaw = String(msg.text || "").trim();
    if (!textRaw) return NextResponse.json({ ok: true });

    const text = textRaw; // keep original
    const textLower = textRaw.toLowerCase();

    // ✅ pilih session yang benar untuk dibalas admin
    const sessionId = await resolveSessionForAdminReply();
    if (!sessionId) {
      console.warn("⚠️ NO SESSION AVAILABLE (queue kosong & lastSession kosong)");
      return NextResponse.json({ ok: true });
    }

    // 🔒 COMMAND TUTUP CHAT (tutup session yang sedang di-handle)
    if (textLower === "/tutup" || textLower === "/close" || textLower === "/klose") {
      // (aman) kalau sid masih nongol di queue, buang
      await removeFromQueue(sessionId);

      await closeSession(sessionId);

      // kirim pesan penutup ke user (via polling)
      await addMessage(sessionId, {
        role: "admin",
        text: "Percakapan telah ditutup oleh admin 🙏",
        ts: Date.now(),
      });

      // reset status admin
      await setAdminActive();
      await setAdminTyping(0);

      // 🔑 lepas active session → siap ambil chat baru dari queue
      await clearAdminActiveSession();

      return NextResponse.json({ ok: true });
    }

    // 💬 PESAN ADMIN BIASA → masuk ke session aktif
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
