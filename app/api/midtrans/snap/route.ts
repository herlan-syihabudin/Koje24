import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.total || !body?.nama || !body?.email || !body?.hp || !body?.payment) {
      return NextResponse.json(
        { success: false, message: "Payload tidak lengkap" },
        { status: 400 }
      );
    }

    const snap = new Midtrans.Snap({
      isProduction: process.env.MIDTRANS_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const orderId = "KOJE-" + Date.now();

    // ✅ Mapping metode bayar (user tidak lihat midtrans)
    let enabledPayments: string[] | undefined;

    if (body.payment === "qris") {
      enabledPayments = ["qris"];
    } else if (body.payment === "ewallet") {
      // bisa tambah/kurang sesuai yang aktif di midtrans account lo
      enabledPayments = ["gopay", "shopeepay"];
    } else {
      // fallback: biarin midtrans tampil semua metode (harusnya ga kepakai karena UI kita cuma qris/ewallet)
      enabledPayments = undefined;
    }

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
      // (opsional) kalau mau rapi di dashboard midtrans:
      // item_details: (body.cart || []).map((x: any) => ({
      //   id: String(x.id),
      //   name: String(x.name).slice(0, 50),
      //   quantity: Number(x.qty || 1),
      //   price: Number(x.price || 0),
      // })),
    });

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
