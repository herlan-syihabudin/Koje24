import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// =======================
// ENV
// =======================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

// =======================
// HELPERS
// =======================
function isAdmin(from: any) {
  return ADMIN_IDS.includes(String(from?.id));
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}

async function answerCallback(id: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: id,
      text: "⏳ Memproses...",
      show_alert: false,
    }),
  });
}

async function disableButtons(chatId: number, messageId: number) {
  await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] },
      }),
    }
  );
}

// =======================
// HANDLER
// =======================
export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, message: "BOT TOKEN kosong" });
  }

  const body = await req.json();

  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const BASE_URL = `${proto}://${host}`;

  /* =================================================
     CALLBACK BUTTON (INLINE BUTTON TELEGRAM)
     FORMAT: set:PAID:INV-XXXX
  ================================================= */
  if (body.callback_query) {
    const cb = body.callback_query;
    const from = cb.from;
    const chatId = cb.message.chat.id;

    await answerCallback(cb.id);

    // 🔐 ADMIN GUARD
    if (!isAdmin(from)) {
      await sendMessage(chatId, "⛔ Kamu tidak punya akses.");
      return NextResponse.json({ ok: true });
    }

    const data = String(cb.data || "");
    const [cmd, statusRaw, invoiceId] = data.split(":");

    if (cmd !== "set" || !statusRaw || !invoiceId) {
      await sendMessage(chatId, "❌ Format perintah tidak valid.");
      return NextResponse.json({ ok: true });
    }

    const status = statusRaw.toUpperCase();

    // 🔁 STATUS VALID
    const ALLOWED_STATUS = [
      "PENDING",
      "PAID",
      "DIPROSES",
      "DIKIRIM",
      "SELESAI",
      "COD",
    ];

    if (!ALLOWED_STATUS.includes(status)) {
      await sendMessage(chatId, "❌ Status tidak dikenali.");
      return NextResponse.json({ ok: true });
    }

    // 🔄 UPDATE STATUS VIA API UTAMA
    const res = await fetch(`${BASE_URL}/api/invoice/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, status }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
      await sendMessage(
        chatId,
        `❌ Gagal update invoice *${invoiceId}*\n${json?.message || ""}`
      );
      return NextResponse.json({ ok: true });
    }

    // 🧹 MATIKAN BUTTON
    await disableButtons(chatId, cb.message.message_id);

    // ✅ SUCCESS
    await sendMessage(
      chatId,
      `✅ *STATUS UPDATED*\n\n` +
        `Invoice: *${invoiceId}*\n` +
        `Status: *${status}*\n\n` +
        `📧 Jika status *PAID*, invoice resmi otomatis dikirim ke email`
    );

    return NextResponse.json({ ok: true });
  }

  /* =================================================
     CHAT COMMAND
     /pay INV-XXXX
     /status INV-XXXX
  ================================================= */
  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const from = msg.from;
    const text = String(msg.text || "").trim();

    // 🔐 ADMIN GUARD
    if (!isAdmin(from)) {
      await sendMessage(chatId, "⛔ Kamu tidak punya akses.");
      return NextResponse.json({ ok: true });
    }

    // COMMAND: /pay INV-XXXX
    if (text.startsWith("/pay")) {
      const [, invoiceId] = text.split(" ");

      if (!invoiceId) {
        await sendMessage(chatId, "❌ Format salah.\nGunakan:\n/pay INV-XXXX");
        return NextResponse.json({ ok: true });
      }

      const res = await fetch(`${BASE_URL}/api/invoice/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, status: "PAID" }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        await sendMessage(
          chatId,
          `❌ Gagal update invoice *${invoiceId}*\n${json?.message || ""}`
        );
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        `✅ Invoice *${invoiceId}* ditandai *PAID*\n📧 Invoice resmi dikirim otomatis`
      );
    }

    // COMMAND: /help
    if (text === "/help") {
      await sendMessage(
        chatId,
        `📌 *Perintah Admin KOJE24*\n\n` +
          `/pay INV-XXXX → Tandai PAID\n` +
          `Klik tombol → Update cepat\n\n` +
          `Status otomatis sync ke:\n• Google Sheet\n• Dashboard\n• Email`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
