import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_LIVECHAT_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_LIVECHAT_ADMIN_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { name, phone, topic, message, sessionId, page } = await req.json();

    const cleanMsg = String(message || "").trim();
    if (!cleanMsg) {
      return NextResponse.json(
        { ok: false, message: "Pesan kosong" },
        { status: 400 }
      );
    }

    const sid = String(sessionId || "").trim();
    if (!sid) {
      return NextResponse.json(
        { ok: false, message: "Session ID kosong" },
        { status: 400 }
      );
    }

    // ❗ TIDAK MENYIMPAN PESAN USER KE SERVER

    const text = `
📩 *LIVE CHAT WEBSITE - KOJE24*

👤 Nama: ${name || "Guest"}
📱 HP: ${phone || "-"}
🏷️ Topik: ${topic || "-"}

🆔 Session: ${sid}
🌐 Page: ${page || "-"}

💬 *Pesan:*
${cleanMsg}
    `.trim();

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!tgRes.ok) {
      return NextResponse.json(
        { ok: false, message: "Gagal kirim ke Telegram" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("LIVECHAT SEND ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
