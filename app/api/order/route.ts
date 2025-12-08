import { NextResponse, NextRequest } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

// 🔐 ENV
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

// 🔑 Fix private key new line
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

// 📌 Nama Sheet yang dipakai (sesuai Excel kamu)
const SHEET_NAME = "Transaksi";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const nama = String(form.get("nama") ?? "").trim();
    const hp = String(form.get("hp") ?? "").trim();
    const alamat = String(form.get("alamat") ?? "").trim();
    const note = String(form.get("note") ?? "").trim();
    const payment = String(form.get("payment") ?? "");
    const distanceKm = Number(form.get("distanceKm") ?? 0);
    const shippingCost = Number(form.get("shippingCost") ?? 0);
    const promoAmount = Number(form.get("promoAmount") ?? 0);
    const promoLabel = String(form.get("promoLabel") ?? "");
    const cartJson = String(form.get("cart") ?? "[]");

    const cart = JSON.parse(cartJson || "[]");

    if (!nama || !hp || !alamat) throw new Error("Data belum lengkap");
    if (!Array.isArray(cart) || cart.length === 0) throw new Error("Keranjang kosong");

    const produkList = cart.map((x: any) => `${x.name} (${x.qty}x)`).join(", ");
    const qtyTotal = cart.reduce((a: number, x: any) => a + Number(x.qty), 0);
    const subtotalCalc = cart.reduce(
      (a: number, x: any) => a + Number(x.price) * Number(x.qty),
      0
    );

    const effectiveOngkir = shippingCost > 0 ? shippingCost : 15000;
    const safePromoAmount = promoAmount > 0 ? promoAmount : 0;
    const effectiveGrandTotal = Math.max(
      0,
      subtotalCalc + effectiveOngkir - safePromoAmount
    );

    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`;
    const paymentLabel =
      payment === "qris" ? "QRIS" : payment === "cod" ? "COD" : "Transfer";
    const promoText = safePromoAmount > 0 ? promoLabel : "-";

    // 🟢 Auth ke Google Sheets
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 🟢 Simpan ke Google Sheet sesuai kolom A–N
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:N`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            invoiceId,                        // A
            new Date().toLocaleString("id-ID"), // B
            nama,                             // C
            hp,                               // D
            alamat,                           // E
            produkList,                       // F
            qtyTotal,                         // G
            subtotalCalc,                     // H
            effectiveOngkir,                  // I
            effectiveGrandTotal,              // J
            promoText,                        // K
            paymentLabel,                     // L
            "Pending",                        // M
            invoiceUrl,                       // N
          ],
        ],
      },
    });

    // 🔥 Notifikasi Telegram Admin
    if (BOT_TOKEN && CHAT_ID) {
      const esc = (t: string) =>
        String(t).replace(/[_*[\]()~>`#+\-=|{}.!]/g, "\\$&");

      const msg =
        `🛒 *ORDER BARU KOJE24*\n#${invoiceId}\n\n` +
        `👤 *${esc(nama)}*\n📞 ${esc(hp)}\n📍 ${esc(alamat)}\n\n` +
        `🍹 *Produk:* ${esc(produkList)}\n` +
        `💳 *Metode:* ${paymentLabel}\n` +
        `💰 *Total:* Rp${effectiveGrandTotal.toLocaleString("id-ID")}\n\n` +
        `📝 Catatan: ${esc(note || "-")}\n` +
        `🔗 ${invoiceUrl}`;

      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: msg,
          parse_mode: "Markdown",
        }),
      });
    }

    // 🔗 Auto WhatsApp ke customer
    const waText = `
Halo kak ${nama}, terima kasih sudah order KOJE24 🍹

Invoice pembelian kakak 👇
${invoiceUrl}

Total pembayaran: Rp${effectiveGrandTotal.toLocaleString("id-ID")}
Metode bayar: ${paymentLabel}

Butuh bantuan? Balas chat ini ya kak 🙏
`.trim();

    const waUrl = `https://api.whatsapp.com/send?phone=${hp.replace(
      /[^0-9]/g,
      ""
    )}&text=${encodeURIComponent(waText)}`;

    // 🔥 Success response ke FE
    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceUrl,
      waUrl,
      grandTotal: effectiveGrandTotal,
    });
  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err.message);
    return NextResponse.json(
      {
        success: false,
        message: err?.message ?? "Order gagal",
      },
      { status: 400 }
    );
  }
}
