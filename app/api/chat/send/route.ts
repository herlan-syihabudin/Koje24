import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { name, message, sessionId, page } = await req.json();

    if (!message) {
      return NextResponse.json(
        { ok: false, message: "Pesan kosong" },
        { status: 400 }
      );
    }

    const text = `
📩 *CHAT WEBSITE - KOJE24*

👤 Nama: ${name || "Guest"}
🆔 Session: ${sessionId || "-"}
🌐 Page: ${page || "-"}

💬 *Pesan:*
${message}
    `;

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
  } catch (error) {
    console.error("CHAT API ERROR:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
