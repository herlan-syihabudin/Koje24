export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getMessages,
  getAdminStatus,
  isAdminTyping,
  isSessionClosed,
} from "@/lib/livechatStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sid = String(searchParams.get("sid") || "").trim();
    const after = Number(searchParams.get("after") || "0");

    /* =====================
       VALIDASI DASAR
    ===================== */
    if (!sid) {
      return NextResponse.json(
        { ok: false, message: "sid kosong" },
        { status: 400 }
      );
    }

    /* =====================
       CEK SESSION CLOSED
       🔑 PENTING: JANGAN KIRIM MESSAGE LAGI
    ===================== */
    const closed = await isSessionClosed(sid);
    if (closed) {
      return NextResponse.json({
        ok: true,
        closed: true,
        messages: [],           // ❗ sengaja kosong
        adminOnline: false,
        adminTyping: false,
      });
    }

    /* =====================
       AMBIL MESSAGE (DELTA / FULL)
    ===================== */
    const messages = await getMessages(
      sid,
      after > 0 ? after : undefined
    );

    /* =====================
       STATUS ADMIN
    ===================== */
    const adminStatus = await getAdminStatus();
    const adminTyping = await isAdminTyping();

    /* =====================
       RESPONSE NORMAL
    ===================== */
    return NextResponse.json({
      ok: true,
      closed: false,
      messages,                           // ❗ TANPA FILTER ULANG
      adminOnline: adminStatus === "online",
      adminTyping,
    });
  } catch (e) {
    console.error("LIVECHAT POLL ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
