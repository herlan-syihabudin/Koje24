import { NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_PUBLIC = process.env.NEXT_PUBLIC_BASE_URL
const BASE_URL =
  BASE_PUBLIC ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000"

export async function POST(req: NextRequest) {
  const body = await req.json()

  // ==============================
  // CASE 1 — CALLBACK BUTTON
  // ==============================
  if (body.callback_query) {
    const callback = body.callback_query
    const chatId = callback.message.chat.id
    const data = callback.data // contoh: paid_INV-ABC123

    const [action, invoiceId] = String(data).split("_")

    let status = "Pending"
    if (action === "paid") status = "Paid"
    if (action === "cod") status = "COD"

    // 🔥 update status invoice via API internal website
    await fetch(`${BASE_URL}/api/invoice/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, status }),
    }).catch((err) => console.error("Update status error:", err))

    // 🔥 balas ke Telegram
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Status invoice *${invoiceId}* diperbarui menjadi *${status}* ✔️`,
        parse_mode: "Markdown",
      }),
    })

    return NextResponse.json({ ok: true })
  }

  // ==============================
  // CASE 2 — USER KIRIM CHAT MANUAL
  // ==============================
  if (body.message) {
    const chatId = body.message.chat.id

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text:
          "👋 Halo! Bot ini khusus untuk *notifikasi order & update status invoice KOJE24*.\nPesanan masuk akan otomatis tampil di sini.",
        parse_mode: "Markdown",
      }),
    })
  }

  return NextResponse.json({ ok: true })
}
