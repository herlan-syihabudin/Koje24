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

/* =====================
   HELPER (TETAP DIPAKAI)
===================== */
async function resolveSessionForAdminReply() {
  const active = await getAdminActiveSession();
  if (active) return active;

  const fromQueue = await dequeueChat();
  if (fromQueue) {
    await setAdminActiveSession(fromQueue);
    return fromQueue;
  }

  return await getLastActiveSessionId();
}

/* =====================
   MAIN HANDLER
===================== */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body?.message;

    if (!msg?.text) return NextResponse.json({ ok: true });

    const textRaw = String(msg.text || "").trim();
    if (!textRaw) return NextResponse.json({ ok: true });

    const textLower = textRaw.toLowerCase();

    /* =====================================================
       🔑 FIX UTAMA (TANPA MERUSAK LOGIC LAMA)
       PRIORITAS: AMBIL SESSION DARI REPLY TELEGRAM
    ===================================================== */
    let sessionId: string | null = null;

    const repliedText =
      msg.reply_to_message?.text ||
      msg.reply_to_message?.caption ||
      "";

    const match = repliedText.match(/Session:\s*([a-zA-Z0-9-]+)/i);
    if (match?.[1]) {
      sessionId = match[1].trim();
    }

    /* =====================================================
       FALLBACK → LOGIC LAMA TETAP JALAN
    ===================================================== */
    if (!sessionId) {
      sessionId = await resolveSessionForAdminReply();
    }

    if (!sessionId) {
      console.warn("⚠️ ADMIN REPLY TAPI SESSION TIDAK DITEMUKAN");
      return NextResponse.json({ ok: true });
    }

    /* =====================================================
       COMMAND TUTUP CHAT
    ===================================================== */
    if (
  textLower === "/tutup" ||
  textLower === "/close" ||
  textLower === "/klose"
) {
  await removeFromQueue(sessionId);

  // 🔥 1️⃣ KIRIM PESAN PENUTUP KE USER (INI YANG KURANG)
  await addMessage(sessionId, {
    role: "admin",
    text: `🙏 Terima kasih sudah menghubungi KOJE24  
Jika masih ada pertanyaan, silakan mulai chat baru 🌿`,
    ts: Date.now(),
  });

  // 🔒 2️⃣ BARU TUTUP SESSION
  await closeSession(sessionId);

  // reset status admin
  await setAdminActive();
  await setAdminTyping(0);
  await clearAdminActiveSession();

  return NextResponse.json({ ok: true });
}

    /* =====================================================
       PESAN ADMIN NORMAL
    ===================================================== */
    await addMessage(sessionId, {
      role: "admin",
      text: textRaw,
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
