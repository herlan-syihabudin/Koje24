import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, phone, address, note, order, total } = body;

    const token = process.env.NEXT_PUBLIC_WHATSAPP_TOKEN!;
    const phoneId = process.env.NEXT_PUBLIC_WHATSAPP_ID!;

    if (!token || !phoneId) {
      return NextResponse.json(
        { ok: false, message: "ENV WhatsApp belum lengkap" },
        { status: 400 }
      );
    }

    // Format pesan yang akan dikirim
    const message = `
📦 *Order Baru KOJE24*
--------------------------------
👤 Nama    : ${name}
📞 HP      : ${phone}
🏠 Alamat  : ${address}
📝 Catatan : ${note || "-"}
--------------------------------
🍹 *Detail Pesanan*:
${order.map((item: any) => `• ${item.qty}× ${item.name}`).join("\n")}
--------------------------------
💰 *Total: Rp ${total.toLocaleString()}*
Terima kasih telah order di KOJE 24! ❤️
`.trim();

    // Kirim ke WhatsApp API
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone.replace(/\D/g, ""), // hanya angka
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await res.json();

    if (!data.messages) {
      return NextResponse.json(
        { ok: false, message: "Gagal mengirim pesan WA", raw: data },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: "WA terkirim", data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: "Server Error", error: e?.message },
      { status: 500 }
    );
  }
}
