export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { closeSession } from "@/lib/livechatStore";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, message: "sessionId required" },
        { status: 400 }
      );
    }

    // ✅ TUTUP SESSION (SINGLE SOURCE OF TRUTH)
    await closeSession(sessionId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ CLOSE CHAT ERROR:", err);
    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );
  }
}
