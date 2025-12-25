export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
  setAdminTyping,
  getLastActiveSessionId,
  closeSession, // 🔴 WAJIB UNTUK TUTUP CHAT
} from "@/lib/livechatStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body?.message;

    // ❌ BUKAN PESAN TEKS
    if (!msg?.text) return NextResponse.json({ ok: true });

    const text = msg.text.trim();
    if (!text) return NextResponse.json({ ok: true });

    // 🔑 Ambil session user terakhir aktif
    const sessionId = await getLastActiveSessionId();
    if (!sessionId) return NextResponse.json({ ok: true });

    // 🔒 COMMAND TUTUP CHAT
    if (text.toLowerCase() === "/tutup") {
      await closeSession(sessionId);

      // kirim pesan penutup ke user (via polling)
      await addMessage(sessionId, {
        role: "admin",
        text: "Percakapan telah ditutup oleh admin 🙏",
        ts: Date.now(),
      });

      // ⭐ jaga konsistensi status
      await setAdminActive();
      await setAdminTyping(0); // hentikan indikator typing

      return NextResponse.json({ ok: true });
    }

    // 💬 PESAN ADMIN BIASA
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
