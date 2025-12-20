import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/livechatStore";

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

    const allMessages = await getMessages(
      sid,
      after > 0 ? after : undefined
    );

    // 🔒 FILTER KETAT: ADMIN SAJA
    const messages = (allMessages || []).filter(
      (m: any) => m.role === "admin"
    );

    return NextResponse.json({ ok: true, messages });
  } catch (e) {
    console.error("LIVECHAT POLL ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
