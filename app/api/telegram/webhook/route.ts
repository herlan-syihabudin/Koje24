import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN)
    return NextResponse.json({ ok: false, message: "Bot token kosong" });

  const body = await req.json();

  // Ambil BASE URL dinamis (lebih aman dari env)
  const host = req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const BASE_URL = `${protocol}://${host}`;

  /* ================================
     CALLBACK BUTTON DARI TELEGRAM
  ================================= */
  if (body.callback_query) {
    const callback = body.callback_query;
    const chatId = callback.message.chat.id;
    const data = callback.data; // contoh: paid_INV-XXXXXX

    const [action, invoiceId] = String(data).split("_");

    if (!invoiceId)
      return NextResponse.json({ ok: false, message: "invoiceId kosong" });

    let status = "Pending";
    if (action === "paid") status = "Paid";
    if (action === "cod") status = "COD";

    // Update Google Sheet
    const res = await fetch(`${BASE_URL}/api/invoice/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, status }),
    });

    if (!res.ok) console.error("❌ Gagal update status invoice ke Google Sheet");

    // Balasan ke Telegram
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Status invoice *${invoiceId}* diperbarui menjadi *${status.toUpperCase()}* ✔️`,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ ok: true });
  }

  /* ================================
     CHAT MANUAL (USER KETIK PESAN)
  ================================= */
  if (body.message) {
    const chatId = body.message.chat.id;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "👋 Bot aktif! Notifikasi pesanan & update invoice akan otomatis dikirim ke sini.",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
