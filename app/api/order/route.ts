import { NextResponse, NextRequest } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

export async function POST(req: NextRequest) {
  try {
    let body: any = await req.json();

    const {
      nama,
      hp,
      alamat,
      note,
      catatan,
      payment,
      cart,
      shippingCost,
      grandTotal,
      subtotal,
      ongkir,
      promoAmount,
      promoLabel,
    } = body;

    if (!nama || !hp || !alamat) throw new Error("Data customer belum lengkap");
    if (!Array.isArray(cart) || cart.length === 0) throw new Error("Cart kosong!");

    const produkList = cart.map((x: any) => `${x.name} (${x.qty}x)`).join(", ");
    const qtyTotal = cart.reduce((a: number, x: any) => a + Number(x.qty || 0), 0);

    const subtotalCalc = typeof subtotal === "number"
      ? subtotal
      : cart.reduce(
          (a: number, x: any) => a + Number(x.price || 0) * Number(x.qty || 0),
          0
        );

    const effectiveOngkir = typeof ongkir === "number"
      ? ongkir
      : typeof shippingCost === "number"
      ? shippingCost
      : 15000;

    const safePromoAmount = typeof promoAmount === "number" && promoAmount > 0
      ? promoAmount
      : 0;

    const effectiveGrandTotal = Math.max(
      0,
      subtotalCalc + effectiveOngkir - safePromoAmount
    );

    let paymentLabel = "Transfer";
    if (payment === "qris") paymentLabel = "QRIS";
    else if (payment === "cod") paymentLabel = "COD";

    const invoiceId = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const invoiceUrl = `${req.nextUrl.origin}/invoice/${invoiceId}`;

    const promoText = safePromoAmount > 0 ? promoLabel || "Promo" : promoLabel || "Tidak ada";

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet2!A:N",
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
          ],
        ],
      },
    });

    // Escape Markdown Telegram
    const escape = (t: string) =>
      String(t).replace(/[_*[\]()~>`#+\-=|{}.!]/g, "\\$&");

    if (BOT_TOKEN && CHAT_ID) {
      const msg =
        `🛒 *ORDER BARU KOJE24*\n#${invoiceId}\n\n` +
        `👤 *${escape(nama)}*\n📍 ${escape(alamat)}\n\n` +
        `🍹 *Pesanan:* ${escape(produkList)}\n` +
        `💰 *Total:* Rp${effectiveGrandTotal.toLocaleString("id-ID")}\n` +
        `💳 *Metode:* ${paymentLabel}\n` +
        `🏷 *Promo:* ${escape(promoText)}\n\n` +
        `📝 Catatan: ${escape(catatan || note || "-")}\n` +
        `🔗 ${invoiceUrl}`;

      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: "Markdown" }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, invoiceUrl });
  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Order gagal" },
      { status: 200 } // tidak 500 supaya FE tetap jalan
    );
  }
}
