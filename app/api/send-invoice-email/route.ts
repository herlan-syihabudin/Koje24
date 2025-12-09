import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, nama, invoiceId, invoiceUrl } = await req.json();

    if (!email || !invoiceId || !invoiceUrl) {
      return NextResponse.json(
        { success: false, message: "Payload tidak lengkap" },
        { status: 400 }
      );
    }

    // 🔥 SMTP Gmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 💌 Format email
    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 15px;">
        <p>Halo <b>${nama}</b>, terima kasih sudah order KOJE24 🍹</p>

        <p>Invoice untuk pesanan kamu sudah dibuat:</p>

        <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">
          ${invoiceId}
        </p>

        <p>
          Klik link invoice kamu di bawah ini 👇<br/>
          <a href="${invoiceUrl}" style="color:#0FA3A8; font-size:16px;">
            Buka Invoice
          </a>
        </p>

        <br />
        <p>Terima kasih sudah mempercayai KOJE24 💚</p>
        <p><i>Minum sehat itu gampang kalau rasanya enak! 🍹</i></p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Invoice Pemesanan — ${invoiceId}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ SEND EMAIL ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim invoice email" },
      { status: 500 }
    );
  }
}
