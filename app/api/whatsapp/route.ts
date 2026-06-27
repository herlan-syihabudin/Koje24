import { NextResponse } from "next/server";

/* ===============================
   HELPERS
================================ */
const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID").format(n);

const normalizePhone = (phone: string) => {
  const clean = phone.replace(/\D/g, "");
  return clean.startsWith("62") ? clean : `62${clean.slice(1)}`;
};

/* ===============================
   POST HANDLER
================================ */
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

    /* ===============================
       BASIC VALIDATION
    ================================ */
    if (
      !invoiceId ||
      !name ||
      !phone ||
      !Array.isArray(order) ||
      order.length === 0
    ) {
      return NextResponse.json(
        { ok: false, message: "Payload tidak lengkap" },
        { status: 400 }
      );
    }

    const token = process.env.WHATSAPP_TOKEN!;
    const phoneId = process.env.WHATSAPP_ID!;
    const adminPhone = process.env.WHATSAPP_ADMIN;

    if (!token || !phoneId) {
      return NextResponse.json(
        { ok: false, message: "ENV WhatsApp belum lengkap" },
        { status: 500 }
      );
    }

    /* ===============================
       FORMAT ORDER
    ================================ */
    const formatItems = order
      .map((item: any) => `• ${item.qty}× ${item.name}`)
      .join("\n");

    /* ===============================
       MESSAGE CUSTOMER
    ================================ */
    const msgCustomer = `
🧾 *Invoice KOJE24 — ${invoiceId}*

Terima kasih sudah order di KOJE24 🍹
Pesanan kamu sedang diproses 🙌

📦 *Detail Order*
${formatItems}

💰 *Ringkasan*
Subtotal : Rp ${rupiah(subtotal)}
Ongkir   : Rp ${rupiah(ongkir)}
Promo    : ${promoLabel || "-"} ${
      promoAmount > 0 ? `(-Rp ${rupiah(promoAmount)})` : ""
    }
----------------------------------
*Total Bayar: Rp ${rupiah(grandTotal)}*

🧍 *Penerima*
${name} — ${phone}
${address}

🔗 *Invoice Online*
${invoiceUrl}

📌 *Metode Pembayaran*
${paymentLabel}

Simpan invoice ini untuk cek status kapan pun ✔️
`.trim();

    /* ===============================
       MESSAGE ADMIN
    ================================ */
    const msgAdmin = `
🛒 *ORDER MASUK — ${invoiceId}*

👤 ${name}
📞 ${phone}
🏠 ${address}

🍹 *Pesanan*
${formatItems}

💰 *Total Bayar: Rp ${rupiah(grandTotal)}*

🔗 Invoice:
${invoiceUrl}

📌 Update status via Telegram Bot:
PAID / COD / CANCEL
`.trim();

    /* ===============================
       SEND TO CUSTOMER
    ================================ */
    const resCustomer = await fetch(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizePhone(phone),
          type: "text",
          text: { body: msgCustomer },
        }),
      }
    );

    const jsonCustomer = await resCustomer.json();

    if (!resCustomer.ok) {
      console.error("WA CUSTOMER ERROR:", jsonCustomer);
      throw new Error("Gagal kirim WhatsApp ke customer");
    }

    /* ===============================
       SEND TO ADMIN (OPTIONAL)
    ================================ */
    if (adminPhone) {
      const resAdmin = await fetch(
        `https://graph.facebook.com/v22.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: normalizePhone(adminPhone),
            type: "text",
            text: { body: msgAdmin },
          }),
        }
      );

      const jsonAdmin = await resAdmin.json();

      if (!resAdmin.ok) {
        console.error("WA ADMIN ERROR:", jsonAdmin);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "WhatsApp berhasil dikirim",
    });
  } catch (err: any) {
    console.error("WA API ERROR:", err);
    return NextResponse.json(
      { ok: false, message: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
