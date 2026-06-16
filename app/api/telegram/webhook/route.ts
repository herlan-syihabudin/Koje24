// app/api/telegram/webhook/route.ts

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
function escapeMarkdown(text: string) {
  if (!text) return "";
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function isAdmin(from: any) {
  return ADMIN_IDS.includes(String(from?.id));
}

async function sendMessage(chatId: number, text: string) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
    if (!res.ok) {
      console.error("❌ SendMessage failed:", await res.text());
    }
  } catch (err) {
    console.error("❌ SendMessage error:", err);
  }
}

async function answerCallback(id: string, text: string = "⏳ Memproses...") {
  try {
    await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: id,
          text,
          show_alert: false,
        }),
      }
    );
  } catch (err) {
    console.error("❌ AnswerCallback error:", err);
  }
}

async function disableButtons(chatId: number, messageId: number) {
  try {
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
  } catch (err) {
    console.error("❌ DisableButtons error:", err);
  }
}

// =======================
// HANDLER
// =======================
export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN missing");
    return NextResponse.json({ ok: false, message: "BOT TOKEN kosong" });
  }

  try {
    const body = await req.json();

    // 🔥 BASE_URL yang lebih reliable
    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      `https://${req.headers.get("host")}`;

    /* =================================================
       CALLBACK BUTTON (INLINE BUTTON TELEGRAM)
       FORMAT: set:PAID:INV-XXXX
    ================================================= */
    if (body.callback_query) {
      const cb = body.callback_query;
      const from = cb.from;
      const chatId = cb.message.chat.id;
      const messageId = cb.message.message_id;

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
        "CANCEL",
      ];

      if (!ALLOWED_STATUS.includes(status)) {
        await sendMessage(chatId, "❌ Status tidak dikenali.");
        return NextResponse.json({ ok: true });
      }

      // 🔄 UPDATE STATUS VIA API UTAMA (dengan timeout)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${BASE_URL}/api/invoice/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, status }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        await sendMessage(
          chatId,
          `❌ Gagal update invoice *${escapeMarkdown(invoiceId)}*\n${escapeMarkdown(
            json?.message || "Unknown error"
          )}`
        );
        return NextResponse.json({ ok: true });
      }

      // 🧹 MATIKAN BUTTON
      await disableButtons(chatId, messageId);

      // ✅ SUCCESS
      let successMsg = `✅ *STATUS UPDATED*\n\n` +
        `Invoice: *${escapeMarkdown(invoiceId)}*\n` +
        `Status: *${escapeMarkdown(status)}*`;

      if (status === "PAID") {
        successMsg += `\n\n📧 Invoice resmi otomatis dikirim ke email customer.`;
      }

      await sendMessage(chatId, successMsg);

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
        const parts = text.split(" ");
        const invoiceId = parts.length > 1 ? parts[1] : null;

        if (!invoiceId) {
          await sendMessage(chatId, "❌ Format salah.\nGunakan:\n/pay INV-XXXX");
          return NextResponse.json({ ok: true });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${BASE_URL}/api/invoice/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId, status: "PAID" }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
          await sendMessage(
            chatId,
            `❌ Gagal update invoice *${escapeMarkdown(invoiceId)}*\n${escapeMarkdown(
              json?.message || "Unknown error"
            )}`
          );
          return NextResponse.json({ ok: true });
        }

        await sendMessage(
          chatId,
          `✅ Invoice *${escapeMarkdown(invoiceId)}* ditandai *PAID*\n📧 Invoice resmi dikirim otomatis`
        );
        return NextResponse.json({ ok: true });
      }

      // COMMAND: /help
      if (text === "/help" || text === "/start") {
        await sendMessage(
          chatId,
          `📌 *Perintah Admin KOJE24*\n\n` +
            `/pay INV-XXXX → Tandai PAID\n` +
            `Klik tombol → Update cepat\n\n` +
            `Status otomatis sync ke:\n• Google Sheet\n• Dashboard\n• Email`
        );
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);

    // Kirim error ke admin
    if (BOT_TOKEN && ADMIN_IDS.length > 0) {
      try {
        await sendMessage(
          Number(ADMIN_IDS[0]),
          `⚠️ *ERROR WEBHOOK*\n${escapeMarkdown(err?.message || "Unknown error")}`
        );
      } catch {}
    }

    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
