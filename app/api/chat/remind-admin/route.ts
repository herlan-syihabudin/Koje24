import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

// escape HTML biar aman di Telegram
function esc(input: string) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  try {
    const { user, sid, page } = await req.json();

    if (!sid) {
      return NextResponse.json(
        { ok: false, message: "sid kosong" },
        { status: 400 }
      );
    }

    const text = `
⏰ <b>REMINDER LIVE CHAT</b>

👤 Nama: ${esc(user?.name || "-")}
🏷️ Topik: ${esc(user?.topic || "-")}

🆔 Session:
<code>${esc(sid)}</code>

🌐 Page: ${esc(page || "-")}

User masih menunggu balasan.
    `.trim();

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("REMINDER SEND ERROR:", err);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("REMINDER ERROR:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
