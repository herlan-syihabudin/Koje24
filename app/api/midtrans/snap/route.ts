import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const snap = new Midtrans.Snap({
      isProduction: process.env.MIDTRANS_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const orderId = "KOJE-" + Date.now();

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: body.total,
      },
      customer_details: {
        first_name: body.nama,
        email: body.email,
        phone: body.hp,
        shipping_address: {
          address: body.alamat,
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    });
  } catch (err) {
    console.error("MIDTRANS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Midtrans error" },
      { status: 500 }
    );
  }
}
