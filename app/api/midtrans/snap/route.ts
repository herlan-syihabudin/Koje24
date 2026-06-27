import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentMethod = "bank" | "qris" | "ewallet";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // =====================
    // VALIDASI PAYLOAD
    // =====================
    if (
      !body?.total ||
      !body?.nama ||
      !body?.email ||
      !body?.hp ||
      !body?.payment
    ) {
      return NextResponse.json(
        { success: false, message: "Payload tidak lengkap" },
        { status: 400 }
      );
    }

    // =====================
    // INIT MIDTRANS SNAP
    // =====================
    const snap = new Midtrans.Snap({
      isProduction: process.env.MIDTRANS_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const orderId = "KOJE-" + Date.now();
    const payment = String(body.payment) as PaymentMethod;

    // =====================
    // MAPPING PAYMENT (INTI)
    // =====================
    let enabledPayments: string[];

    if (payment === "bank") {
      enabledPayments = ["bank_transfer"];
    } else if (payment === "qris") {
      enabledPayments = ["qris"];
    } else if (payment === "ewallet") {
      enabledPayments = ["gopay", "shopeepay"];
    } else {
      enabledPayments = ["bank_transfer"];
    }

    // =====================
    // CREATE TRANSACTION
    // =====================
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(body.total),
      },
      enabled_payments: enabledPayments,
      customer_details: {
        first_name: body.nama,
        email: body.email,
        phone: body.hp,
        shipping_address: {
          address: body.alamat || "",
        },
      },
    });

    // =====================
    // RESPONSE
    // =====================
    return NextResponse.json({
      success: true,
      token: transaction.token,
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
