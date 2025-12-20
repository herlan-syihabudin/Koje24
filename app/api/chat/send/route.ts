import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { name, phone, topic, message, sessionId, page } = await req.json();

    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const text = `
📩 *LIVE CHAT WEBSITE - KOJE24*

👤 Nama: ${name}
📱 HP: ${phone || "-"}
🏷️ Topik: ${topic}

🆔 Session:
\`${sessionId}\`

🌐 Page: ${page}

💬 *Pesan:*
${message}
    `.trim();

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "💬 Balas Chat Ini",
                callback_data: `reply:${sessionId}`,
              },
            ],
          ],
        },
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
