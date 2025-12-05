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
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error("Environment Google Sheet belum lengkap");
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      throw new Error("Body JSON tidak valid");
    }

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

    // Produk
    const produkList = cart.map((x: any) => `${x.name} (${x.qty}x)`).join(", ");
    const qtyTotal = cart.reduce(
      (a: number, x: any) => a + Number(x.qty || 0),
      0
    );

    const subtotalCalc =
      typeof subtotal === "number"
        ? subtotal
        : cart.reduce(
            (a: number, x: any) =>
              a + Number(x.price || 0) * Number(x.qty || 0),
            0
          );

    const effectiveOngkir =
      typeof ongkir === "number"
        ? ongkir
        : typeof shippingCost === "number"
        ? shippingCost
        : 15000;

    const safePromoAmount =
      typeof promoAmount === "number" && promoAmount > 0 ? promoAmount : 0;

    const rawGrandTotal =
      typeof grandTotal === "number"
        ? grandTotal
        : subtotalCalc + effectiveOngkir - safePromoAmount;

    const effectiveGrandTotal = Math.max(0, rawGrandTotal);

    // Payment label
    let paymentLabel = "Transfer";
    if (payment === "qris") paymentLabel = "QRIS";
    else if (payment === "cod") paymentLabel = "COD";

    // Invoice ID & URL
    const invoiceId =
      "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const host = req.nextUrl.host;
    const protocol = req.nextUrl.protocol; // "https:" misalnya
    const invoiceUrl = `${protocol}//${host}/invoice/${invoiceId}`;

    // Promo text
    const promoText =
      safePromoAmount > 0
        ? `${promoLabel || "Promo"}`
        : promoLabel || "Tidak ada";

    // Save ke Google Sheet database (Sheet2 transaksi)
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
            invoiceId, // A - Invoice
            new Date().toLocaleString("id-ID"), // B - Tanggal
            nama, // C
            hp, // D
            alamat, // E
            produkList, // F
            qtyTotal, // G
            subtotalCalc, // H
            effectiveOngkir, // I
            effectiveGrandTotal, // J
            promoText, // K (label promo)
            paymentLabel, // L
            "Pending", // M - Status
            invoiceUrl, // N - URL
          ],
        ],
      },
    });

    // Notifikasi Telegram admin
    if (BOT_TOKEN && CHAT_ID) {
      try {
        const msg = `
🛒 *ORDER BARU KOJE24*
#${invoiceId}

👤 *${nama}*
📍 ${alamat}

🍹 *Pesanan:* ${produkList}
💰 *Total:* Rp${effectiveGrandTotal.toLocaleString("id-ID")}
💳 *Metode:* ${paymentLabel}
🏷 *Promo:* ${promoText}

📝 Catatan: ${catatan || note || "-"}
🔗 ${invoiceUrl}
`.trim();

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "Markdown",
          }),
        });
      } catch {}
    }

    console.log(`🟢 ORDER TERSIMPAN: ${invoiceId}`);
    return NextResponse.json({ success: true, invoiceUrl });
  } catch (err: any) {
    console.error("❌ ERROR ORDER:", err);
    return NextResponse.json(
      { success: false, message: err.message ?? "Order gagal" },
      { status: 500 }
    );
  }
}
