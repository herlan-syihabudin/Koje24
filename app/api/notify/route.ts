import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { invoiceId, nama, alamat, produk, total, invoiceUrl } = body

    if (!invoiceId || !nama) {
      throw new Error("Data tidak lengkap untuk notifikasi Telegram")
    }

    const text = `
🛒 *ORDER BARU KOJE24*
#${invoiceId}

👤 *${nama}*
📍 ${alamat}

🍹 *Pesanan:* ${produk}
💰 *Total:* Rp${total.toLocaleString("id-ID")}

🔗 ${invoiceUrl}
`.trim()

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
      }),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Telegram notify error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
