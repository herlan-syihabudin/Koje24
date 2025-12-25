import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get("sid");

  if (!sid) {
    return NextResponse.json({ ok: false });
  }

  // ambil antrian
  const queue = (await kv.lrange("chat:queue", 0, -1)) as string[];

  const position = queue.indexOf(sid);

  // admin lagi pegang siapa
  const activeSession = await kv.get<string>("admin:activeSession");

  return NextResponse.json({
    ok: true,
    inQueue: position !== -1,
    position: position !== -1 ? position + 1 : null,
    queueLength: queue.length,
    adminBusy: !!activeSession && activeSession !== sid,
  });
}
