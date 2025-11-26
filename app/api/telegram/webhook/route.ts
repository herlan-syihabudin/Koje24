import { NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export async function POST(req: NextRequest) {
  const body = await req.json()

  // ==============================
  // CASE 1 → CALLBACK BUTTON
  // ==============================
  if (body.callback_query) {
    const callback = body.callback_query
    const chatId = callback.message.chat.id
    const data = callback.data // contoh: paid_INV-XX1D5GA

    const [action, invoiceId] = String(data).split("_")

    let status = "Pending"
    if (action === "paid") status = "Paid"
    if (action === "cod") status = "COD"

    // panggil API update status ke Google Sheet
    await fetch(`${BASE_URL}/api/invoice/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, status }),
    })

    // kirim balasan ke Telegram
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
  // CASE 2 → USER SEND MESSAGE MANUAL
  // ==============================
  if (body.message) {
    const chatId = body.message.chat.id

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "👋 Halo! Bot ini khusus untuk notifikasi & update status invoice.\nPesanan masuk akan otomatis tampil di sini.",
      }),
    })
  }

  return NextResponse.json({ ok: true })
}
