import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import {
  getMessages,
  getAdminStatus,
  isAdminTyping,
} from "@/lib/livechatStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sid = String(searchParams.get("sid") || "").trim();
    const after = Number(searchParams.get("after") || "0");

    if (!sid) {
      return NextResponse.json(
        { ok: false, message: "sid kosong" },
        { status: 400 }
      );
    }

    // 🔹 1) AMBIL PESAN (LOGIKA ASLI - TIDAK DIUBAH)
    const messages = await getMessages(
      sid,
      after > 0 ? after : undefined
    );

    // 🔹 2) STATUS ADMIN (LOGIKA ASLI - TIDAK DIUBAH)
    const adminStatus = await getAdminStatus();
    const adminTyping = await isAdminTyping();

    // 🔹 3) BACA STATE SESSION DARI KV (READ ONLY, TANPA UBAH APA PUN)
    // key ini sudah dipakai di /api/chat/close
    const session = await kv.hgetall<{ state?: string }>(
      `chat:session:${sid}`
    );

    // default: kalau belum ada state, kita anggap "waiting"
    const state = (session?.state as "waiting" | "active" | "closed" | undefined) || "waiting";

    return NextResponse.json({
      ok: true,
      messages, // ⬅️ TETAP: tidak difilter
      adminOnline: adminStatus === "online",
      adminTyping,
      state, // 👈 FIELD BARU: DIPAKAI FRONTEND BUAT ANTRIAN
    });
  } catch (e) {
    console.error("LIVECHAT POLL ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
