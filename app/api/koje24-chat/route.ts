// app/api/koje24-chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Kamu adalah KOJE24 Assistant, CS digital untuk brand cold-pressed juice premium KOJE24.

Gaya bahasa:
- Ramah, santai, tapi tetap sopan
- Singkat, jelas, tidak bertele-tele
- Kadang boleh pakai emoji, tapi jangan kebanyakan

Tugas utama:
- Bantu user memilih varian jus berdasarkan kebutuhan (detox, imun, kulit, energi, dsb)
- Jelaskan keunggulan KOJE24: natural, tanpa gula tambahan, tanpa pengawet, bahan segar
- Jelaskan cara order di website (pilih varian, isi data, dapat invoice, bayar via transfer/QR)
- Jawab pertanyaan seputar pengiriman, penyimpanan, dan cara konsumsi

Jika user tanya di luar konteks jus/minuman sehat:
- Tetap jawab singkat dan ramah, tapi arahkan halus kembali ke produk KOJE24.

Selalu gunakan bahasa Indonesia.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY belum diset di environment");
      return NextResponse.json(
        { error: "Server belum dikonfigurasi dengan benar." },
        { status: 500 }
      );
    }

    // Bentuk payload buat OpenAI
    const payload = {
      model: "gpt-4.1-mini", // boleh lu ganti kalau mau
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.6,
      max_tokens: 400,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ OpenAI error:", errText);
      return NextResponse.json(
        { error: "Gagal menghubungi server AI." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() ??
      "Maaf, lagi ada kendala sistem. Coba lagi sebentar ya 🙏";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("❌ Error di /api/koje24-chat:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server." },
      { status: 500 }
    );
  }
}
