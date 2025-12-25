import { NextRequest, NextResponse } from "next/server";
import { getQueuePosition } from "@/lib/chatQueue";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get("sid");

  if (!sid) return NextResponse.json({ ok: false });

  const position = await getQueuePosition(sid);
  return NextResponse.json({
    ok: true,
    position, // number | null
  });
}
