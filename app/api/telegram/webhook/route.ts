import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

// 🔐 WAJIB: whitelist admin Telegram ID
const ADMIN_IDS = [
  "123456789", // ganti dengan telegram user id admin
];

function isAdmin(from: any) {
  return ADMIN_IDS.includes(String(from?.id));
}

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, message: "Bot token kosong" });
  }

  const body = await req.json();

  const host = req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const BASE_URL = `${protocol}://${host}`;

  /* =====================================
     CALLBACK BUTTON (INLINE BUTTON)
  ===================================== */
  if (body.callback_query) {
    const cb = body.callback_query;
    const from = cb.from;
    const chatId = cb.message.chat.id;

    // 🔐 ADMIN GUARD
    if (!isAdmin(from)) {
      await sendMessage(chatId, "⛔ Kamu tidak punya akses.");
      return NextResponse.json({ ok: true });
    }

    const data = String(cb.data || ""); // paid_INV-XXXX
    const [action, invoiceId] = data.split("_");

    if (!invoiceId) {
      await sendMessage(chatId, "❌ Invoice ID tidak ditemukan.");
      return NextResponse.json({ ok: true });
    }

    // 🔁 STATUS MAP (KONSISTEN)
    let status: "Paid" | "COD" | "Pending" = "Pending";
    if (action === "paid") status = "Paid";
    if (action === "cod") status = "COD";

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

    // ✅ SUCCESS
    await sendMessage(
      chatId,
      `✅ *STATUS UPDATED*\n\nInvoice: *${invoiceId}*\nStatus: *${status}*\n📧 Invoice resmi dikirim otomatis`
    );

    return NextResponse.json({ ok: true });
  }

  /* =====================================
     CHAT BIASA (COMMAND)
  ===================================== */
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
        await sendMessage(chatId, "❌ Gunakan format:\n/pay INV-XXXX");
        return NextResponse.json({ ok: true });
      }

      const res = await fetch(`${BASE_URL}/api/invoice/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, status: "Paid" }),
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
  }

  return NextResponse.json({ ok: true });
}

/* =========================
   HELPER SEND MESSAGE
========================= */
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
