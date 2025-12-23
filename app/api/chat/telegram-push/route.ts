import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();

  const session = await kv.hgetall<any>(`chat:session:${sessionId}`);
  const msgs = (await kv.lrange(`chat:${sessionId}`, 0, -1)) as any[];
  const firstMsg = msgs.find((m) => m.role === "user");

  const text = `
📩 LIVE CHAT BARU

Nama: ${session?.name || "-"}
Topik: ${session?.topic || "-"}
Halaman: ${session?.page || "-"}

Session:
<code>${sessionId}</code>

Pesan:
${firstMsg?.text || "-"}
`.trim();

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    }),
  });

  return NextResponse.json({ ok: true });
}
