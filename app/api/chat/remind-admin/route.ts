import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { user, sid, page } = await req.json();

    const text = `
⏰ *REMINDER LIVE CHAT*

👤 Nama: ${user?.name || "-"}
🏷️ Topik: ${user?.topic || "-"}

🆔 Session: ${sid}
🌐 Page: ${page}

User masih menunggu balasan.
    `.trim();

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}
