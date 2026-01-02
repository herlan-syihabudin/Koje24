import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ⬅ wajib untuk Nodemailer

export async function POST(req: NextRequest) {
  try {
    const { email, nama, invoiceId, invoiceUrl } = await req.json();

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
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // =========================
    // EMAIL TEMPLATE (UPGRADE)
    // =========================
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice Pemesanan KOJE24</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;box-shadow:0 12px 30px rgba(11,75,80,0.12);overflow:hidden;">
          
          <!-- HEADER -->
          <tr>
            <td style="padding:22px 28px;background:#0FA3A8;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">
  KOJE24
</h1>
<p style="margin:4px 0 0;font-size:12px;opacity:0.95;">
  PT KOJE NATURAL INDONESIA
</p>
<p style="margin:2px 0 0;font-size:13px;opacity:0.9;">
  Natural Cold-Pressed Juice
</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px;">
              <p style="font-size:15px;color:#0B4B50;margin:0 0 14px;">
                Halo <strong>${nama}</strong>,
              </p>

              <p style="font-size:14px;color:#333;margin:0 0 16px;line-height:1.6;">
                Terima kasih telah melakukan pemesanan di <strong>KOJE24</strong>.
                Invoice untuk pesanan kamu telah kami siapkan dengan detail sebagai berikut:
              </p>

              <!-- INVOICE BOX -->
              <div style="margin:20px 0;padding:16px;border:1px dashed #cfe8e8;border-radius:10px;background:#f9fefe;text-align:center;">
                <p style="margin:0;font-size:13px;color:#666;">
                  Nomor Invoice
                </p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#0B4B50;letter-spacing:1px;">
                  ${invoiceId}
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:26px 0;">
                <a href="${invoiceUrl}"
                  style="
                    display:inline-block;
                    padding:14px 26px;
                    background:#0FA3A8;
                    color:#ffffff;
                    font-size:14px;
                    font-weight:600;
                    text-decoration:none;
                    border-radius:999px;
                    box-shadow:0 10px 25px rgba(15,163,168,0.35);
                  ">
                  🔗 Lihat Invoice
                </a>
              </div>

              <p style="font-size:13px;color:#555;line-height:1.6;margin:0;">
                Jika kamu memiliki pertanyaan terkait pesanan atau invoice ini,
                silakan hubungi kami melalui WhatsApp atau balas email ini.
              </p>

              <p style="margin:22px 0 0;font-size:14px;color:#0B4B50;">
                Terima kasih atas kepercayaan kamu 💚
              </p>

              <p style="margin:6px 0 0;font-size:13px;color:#777;font-style:italic;">
                Minum sehat itu gampang kalau rasanya enak! 🍹
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:18px 28px;background:#f0f8f8;font-size:11px;color:#666;text-align:center;">
              © ${new Date().getFullYear()} KOJE24 • Cold-Pressed Juice Alami  
              <br />
              Email ini dikirim secara otomatis, mohon tidak membalas langsung.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
