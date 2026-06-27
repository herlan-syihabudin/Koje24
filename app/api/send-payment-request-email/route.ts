import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, nama, invoiceId, invoiceUrl, total, paymentLabel } =
      await req.json();

    if (!email || !invoiceId || !invoiceUrl) {
      return NextResponse.json(
        { success: false, message: "Payload tidak lengkap" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f7f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;box-shadow:0 12px 30px rgba(11,75,80,0.12);overflow:hidden;">
        <tr>
          <td style="padding:22px 28px;background:#0FA3A8;color:#fff;">
            <h1 style="margin:0;font-size:20px;font-weight:700;">KOJE24</h1>
            <p style="margin:4px 0 0;font-size:12px;opacity:.95;">PT KOJE NATURAL INDONESIA</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 10px;color:#0B4B50;">Halo <b>${nama || "Customer"}</b>,</p>
            <p style="margin:0 0 14px;color:#333;line-height:1.6;">
              Pesanan kamu sudah kami terima. Silakan lakukan pembayaran agar pesanan bisa kami proses.
            </p>

            <div style="margin:18px 0;padding:14px;border:1px dashed #cfe8e8;border-radius:10px;background:#f9fefe;">
              <div style="font-size:12px;color:#666;">Nomor Invoice</div>
              <div style="font-size:18px;font-weight:700;color:#0B4B50;margin-top:4px;">${invoiceId}</div>
              <div style="font-size:12px;color:#666;margin-top:8px;">Metode: <b>${paymentLabel || "-"}</b></div>
              <div style="font-size:12px;color:#666;margin-top:4px;">Total: <b>Rp ${Number(total || 0).toLocaleString("id-ID")}</b></div>
            </div>

            <div style="text-align:center;margin:22px 0;">
              <a href="${invoiceUrl}" style="display:inline-block;padding:12px 20px;background:#0FA3A8;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;">
                Lihat Detail Pesanan
              </a>
            </div>

            <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
              Setelah pembayaran dikonfirmasi, <b>invoice resmi</b> akan otomatis dikirim ke email ini.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:#f0f8f8;font-size:11px;color:#666;text-align:center;">
            © ${new Date().getFullYear()} KOJE24 • Email otomatis
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Permintaan Pembayaran — ${invoiceId}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SEND PAYMENT EMAIL ERROR:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal kirim email pembayaran" },
      { status: 500 }
    );
  }
}
