import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.callback_query) return NextResponse.json({ ok: true })

  const callback = body.callback_query
  const chatId = callback.message.chat.id
  const data = callback.data // contoh: paid_INV-ABC123

  const [action, invoiceId] = data.split("_")

  let status = "Pending"
  if (action === "paid") status = "Paid"
  if (action === "cod") status = "COD"

  // panggil API update status sheet
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId, status }),
  })

  // respon ke Telegram
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Status invoice *${invoiceId}* berhasil diperbarui menjadi *${status}*.`,
        parse_mode: "Markdown",
      }),
    }
  )

  return NextResponse.json({ ok: true })
}
