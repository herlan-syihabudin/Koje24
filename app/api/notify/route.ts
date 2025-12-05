import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!

export async function POST(req: Request) {
  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("ENV TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diisi")
    }

    const body = await req.json()
    const {
      invoiceId,
      nama,
      hp,
      alamat,
      produk = [],
      total,
      invoiceUrl = "-",
    } = body

    if (!invoiceId || !nama) {
      throw new Error("invoiceId & nama wajib")
    }

    const formatProduk =
      Array.isArray(produk) && produk.length > 0
        ? produk.map((p: any) => `• ${p.qty}× ${p.name}`).join("\n")
        : "-"

    const now = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })

    const text = `
🛒 *ORDER BARU — KOJE24*
📍 ${now}

🧾 *Invoice:* ${invoiceId}

👤 *Customer:*
${nama}
📞 ${hp || "-"}

🏠 *Alamat:*
${alamat || "-"}

🍹 *Pesanan:*
${formatProduk}

💰 *Total Bayar:* Rp${Number(total || 0).toLocaleString("id-ID")}

🔗 *Invoice:*
${invoiceUrl}
`.trim()

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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

    // kirim log error ke admin Telegram jika token + chat_id ada
    if (BOT_TOKEN && CHAT_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: `⚠️ *ERROR NOTIFIKASI TELEGRAM*\n${err?.message || err}`,
            parse_mode: "Markdown",
          }),
        })
      } catch {}
    }

    return NextResponse.json({ success: false }, { status: 500 })
  }
}
