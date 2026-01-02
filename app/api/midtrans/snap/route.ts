import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

export async function POST(req: Request) {
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
    token: transaction.token,
    orderId,
  });
}
