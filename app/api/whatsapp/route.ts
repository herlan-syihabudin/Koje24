import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      invoiceUrl,
      name,
      phone,
      address,
      note,
      order,
      subtotal,
      ongkir,
      promoLabel,
      promoAmount,
      grandTotal,
      paymentLabel,
    } = body;

    const token = process.env.WHATSAPP_TOKEN!;
    const phoneId = process.env.WHATSAPP_ID!;
    const adminPhone = process.env.WHATSAPP_ADMIN!; // nomor admin

    if (!token || !phoneId) {
      return NextResponse.json({ ok: false, message: "ENV WA tidak lengkap" });
    }

    const formatItems = order
      .map((item: any) => `• ${item.qty}× ${item.name}`)
      .join("\n");

    // ==== PESAN UNTUK CUSTOMER ====
    const msgCustomer = `
🧾 *Invoice KOJE24 — ${invoiceId}*

Terima kasih sudah order di KOJE 24 🍹
Pesanan kamu sedang diproses 🙌

📦 *Detail Order*
${formatItems}

💰 *Summary*
Subtotal : Rp ${subtotal.toLocaleString("id-ID")}
Ongkir   : Rp ${ongkir.toLocaleString("id-ID")}
Promo    : ${promoLabel || "-"} ${
      promoAmount > 0 ? `(-Rp ${promoAmount.toLocaleString("id-ID")})` : ""
    }
----------------------------------
*Total Bayar: Rp ${grandTotal.toLocaleString("id-ID")}*

🧍 *Penerima*
${name} — ${phone}
${address}

🔗 *Invoice Online*
${invoiceUrl}

📌 *Metode Pembayaran*
${paymentLabel}

Simpan invoice ini untuk cek status kapan pun ✔️
`.trim();

    // ==== PESAN UNTUK ADMIN ====
    const msgAdmin = `
🛒 *ORDER MASUK — ${invoiceId}*

👤 ${name}
📞 ${phone}
🏠 ${address}

🍹 *Pesanan*
${formatItems}

💰 *Total Bayar: Rp ${grandTotal.toLocaleString("id-ID")}*

🔗 Invoice:
${invoiceUrl}

📌 Update status via Telegram Bot:
PAID / COD / CANCEL
`.trim();

    // Kirim ke customer
    await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace(/\D/g, ""),
        type: "text",
        text: { body: msgCustomer },
      }),
    });

    // Kirim ke admin
    if (adminPhone) {
      await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminPhone.replace(/\D/g, ""),
          type: "text",
          text: { body: msgAdmin },
        }),
      });
    }

    return NextResponse.json({ ok: true, message: "WA terkirim" });
  } catch (err: any) {
    console.error("WA API ERROR:", err);
    return NextResponse.json(
      { ok: false, message: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
