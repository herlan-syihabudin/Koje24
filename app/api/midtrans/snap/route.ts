import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      order_id,
      gross_amount,
      customer_name,
      customer_email,
      customer_phone,
    } = body;

    if (!order_id || !gross_amount) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const auth = Buffer.from(serverKey + ":").toString("base64");

    const snapUrl =
      process.env.MIDTRANS_ENV === "production"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const res = await fetch(snapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id,
          gross_amount,
        },
        customer_details: {
          first_name: customer_name,
          email: customer_email,
          phone: customer_phone,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Midtrans error" },
      { status: 500 }
    );
  }
}
