import { NextResponse, NextRequest } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

// 🔐 ENV
const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

// 🛠 Fix Private Key
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

// 📌 Nama Sheet
const SHEET_NAME = "Transaksi";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const nama = String(form.get("nama") ?? "").trim();
    const hp = String(form.get("hp") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const alamat = String(form.get("alamat") ?? "").trim();
    const note = String(form.get("note") ?? "").trim();
    const payment = String(form.get("payment") ?? "");
    const distanceKm = Number(form.get("distanceKm") ?? 0);
    const shippingCost = Number(form.get("shippingCost") ?? 0);
    const promoAmount = Number(form.get("promoAmount") ?? 0);
    const promoLabel = String(form.get("promoLabel") ?? "");

    // 💥 Cart fallback aman
    const cartJson = String(
      form.get("cart") ||
      form.get("items") ||
      form.get("keranjang") ||
      "[]"
    );
    let cart: any[] = [];
    try {
      cart = JSON.parse(cartJson);
    } catch {
      cart = [];
    }

    // 🛑 Validasi wajib
    if (!nama || !hp || !alamat || !email) throw new Error("Data belum lengkap");
    if (!Array.isArray(cart) || cart.length === 0) throw new Error("Keranjang kosong");

    const produkList = cart.map((x: any) => `${x.name} (${x.qty}x)`).join(", ");
    const qtyTotal = cart.reduce((a, x) => a + Number(x.qty), 0);
    const subtotalCalc = cart.reduce((a, x) => a + Number(x.price) * Number(x.qty), 0);

    const effectiveOngkir = shippingCost > 0 ? shippingCost : 15000;
    const safePromoAmount = promoAmount > 0 ? promoAmount : 0;
    const effectiveGrandTotal = Math.max(0, subtotalCalc + effectiveOngkir - safePromoAmount);

    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const invoiceUrl = `${baseUrl}/invoice/${invoiceId}`;

    const paymentLabel =
      payment === "qris" ? "QRIS" : payment === "cod" ? "COD" : "Transfer";

    const promoText = safePromoAmount > 0 ? promoLabel : "-";

    // 🟢 Simpan ke Google Sheet (kolom O untuk Email)
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            invoiceId,
            new Date().toLocaleString("id-ID"),
            nama,
            hp,
            alamat,
            produkList,
            qtyTotal,
            subtotalCalc,
            effectiveOngkir,
            effectiveGrandTotal,
            promoText,
            paymentLabel,
            "Pending",
            invoiceUrl,
            email,
          ],
        ],
      },
    });

    // 🔥 Telegram notif (opsional)
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

    // 🚀 Trigger auto-email invoice (WAJIB pakai await biar stabil di Vercel)
    await fetch(`${baseUrl}/api/send-invoice-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        nama,
        invoiceId,
        invoiceUrl,
      }),
    });
    
// 🔔 AUTO SUBSCRIBE (NON-BLOCKING, TIDAK BOLEH GAGALKAN ORDER)
fetch(`${baseUrl}/api/subscribe`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    source: "checkout",
  }),
}).catch(() => {
  // sengaja dikosongkan
});

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceUrl,
    });
  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Order gagal" },
      { status: 400 }
    );
  }
}
