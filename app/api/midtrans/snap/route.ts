import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

export const runtime = "nodejs";        // ⬅️ WAJIB
export const dynamic = "force-dynamic"; // ⬅️ WAJIB

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.total || !body?.nama || !body?.email) {
      return NextResponse.json(
        { message: "Payload tidak lengkap" },
        { status: 400 }
      );
    }

    const snap = new Midtrans.Snap({
      isProduction: false, // 🔥 ganti true kalau LIVE
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const orderId = `KOJE-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(Number(body.total)), // 🔥 WAJIB integer
      },
      customer_details: {
        first_name: body.nama,
        email: body.email,
        phone: body.hp || "",
        shipping_address: {
          address: body.alamat || "",
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      orderId,
    });
  } catch (err: any) {
    console.error("❌ MIDTRANS SNAP ERROR:", err);
    return NextResponse.json(
      { message: "Gagal membuat transaksi Midtrans" },
      { status: 500 }
    );
  }
}
