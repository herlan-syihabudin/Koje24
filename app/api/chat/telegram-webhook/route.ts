import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  setAdminActive,
} from "@/lib/livechatStore";

/**
 * ================================
 * GET — TEST ENDPOINT
 * ================================
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Telegram webhook endpoint is alive (DEBUG MODE)",
  });
}

/**
 * ================================
 * POST — TELEGRAM → WEB (DEBUG)
 * ================================
 * TANPA:
 * - reply
 * - admin filter
 * - session parsing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = body.message;

    if (!msg?.text) {
      return NextResponse.json({ ok: true });
    }

    // 🔥 HARDCODE SESSION UNTUK TEST
    const sessionId = "DEBUG_SESSION";

    // 💾 SIMPAN PESAN TELEGRAM KE KV
    await addMessage(sessionId, {
      role: "admin",
      text: msg.text,
      ts: Date.now(),
    });

    // 🟢 SET ADMIN ONLINE
    await setAdminActive();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}
