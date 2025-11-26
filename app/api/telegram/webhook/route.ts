import { NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://webkoje-cacs.vercel.app"

export async function POST(req: NextRequest) {
  const body = await req.json()

  // CALLBACK BUTTON
  if (body.callback_query) {
    const callback = body.callback_query
    const chatId = callback.message.chat.id
    const data = callback.data // paid_INV-XXXXXX

    const [action, invoiceId] = String(data).split("_")

    let status = "Pending"
    if (action === "paid") status = "Paid"
    if (action === "cod") status = "COD"

    // Update status ke Google Sheet via API
    await fetch(`${BASE_URL}/api/invoice/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, status }),
    })

    // Balasan ke Telegram
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Status invoice *${invoiceId}* diperbarui menjadi *${status.toUpperCase()}* ✔️`,
        parse_mode: "Markdown",
      }),
    })

    return NextResponse.json({ ok: true })
  }

  // MANUAL MESSAGE
  if (body.message) {
    const chatId = body.message.chat.id
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "👋 Bot aktif! Notifikasi pesanan & update invoice akan otomatis dikirim ke sini.",
      }),
    })
  }

  return NextResponse.json({ ok: true })
}
