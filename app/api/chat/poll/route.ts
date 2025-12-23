import { NextRequest, NextResponse } from "next/server";
import {
  getMessages,
  getAdminStatus,
  isAdminTyping,
} from "@/lib/livechatStore";
import { kv } from "@vercel/kv"; // 🆕

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

    const messages = await getMessages(
      sid,
      after > 0 ? after : undefined
    );

    const adminStatus = await getAdminStatus();
    const adminTyping = await isAdminTyping();

    // 🔥 AMBIL STATE SESSION
    const session = await kv.hgetall<any>(`chat:session:${sid}`);

    return NextResponse.json({
      ok: true,
      messages,
      adminOnline: adminStatus === "online",
      adminTyping,
      state: session?.state || "waiting", // 🆕 INI KUNCI TERAKHIR
    });
  } catch (e) {
    console.error("LIVECHAT POLL ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
