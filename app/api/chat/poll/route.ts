import { NextRequest, NextResponse } from "next/server";
import {
  getMessages,
  getAdminStatus,
  isAdminTyping,
  isSessionClosed, // ⭐ TAMBAHAN
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

    // 🔒 CEK APAKAH CHAT SUDAH DITUTUP ADMIN
    const closed = await isSessionClosed(sid);
    if (closed) {
      return NextResponse.json({
        ok: true,
        closed: true,      // ⭐ INI KUNCI UTAMA
        messages: [],
        adminOnline: false,
        adminTyping: false,
      });
    }

    const messages = await getMessages(
      sid,
      after > 0 ? after : undefined
    );

    const adminStatus = await getAdminStatus();
    const adminTyping = await isAdminTyping();

    return NextResponse.json({
      ok: true,
      messages,           // ⬅️ TETAP TIDAK DIFILTER
      adminOnline: adminStatus === "online",
      adminTyping,
      closed: false,      // ⭐ EXPLICIT
    });
  } catch (e) {
    console.error("LIVECHAT POLL ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
