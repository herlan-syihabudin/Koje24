import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let { messages } = await req.json();

    // 🔥 FIX PALING PENTING
    // Jika datang sebagai string dari halaman Pusat Bantuan → ubah jadi array
    if (!Array.isArray(messages)) {
      messages = [{ role: "user", content: String(messages) }];
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID;
    const projectId = process.env.OPENAI_PROJECT_ID;

    if (!apiKey || !orgId || !projectId) {
      console.error("MISSING ENV:", { apiKey, orgId, projectId });
      return NextResponse.json(
        { reply: "Server belum terkonfigurasi dengan benar." },
        { status: 500 }
      );
    }

    const systemPersona = `
Kamu adalah KOJE24 Assistant.

GAYA:
- Natural, santai, manusia banget
- Jawaban pendek, langsung to the point
- Tidak formal
- Hindari paragraf panjang

VARIAN PRODUK:
- Green Detox
- Yellow Immunity
- Beetroot Power
- Sunrise Fresh
- Celery Cleanse
- Carrot Boost

MAPPING:
- Maag: Sunrise Fresh
- Detox harian: Green Detox
- Stamina/imun: Yellow Immunity
- Peredaran darah / tenaga: Beetroot Power
- Anti-begah/pencernaan: Celery Cleanse
- Mata & energi siang: Carrot Boost

ATURAN:
- Selalu pilih 1 varian paling cocok
- Baru kasih 1 alternatif jika diminta
- Jangan jelasin teori kesehatan panjang-panjang
- Jangan gaya AI, cukup kayak manusia
`;

    const conversation = messages
      .map((m: any) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
      .join("\n");

    const finalInput = `
SYSTEM:
${systemPersona}

RIWAYAT CHAT:
${conversation}

Balas sebagai KOJE24 Assistant:
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Organization": orgId,
        "OpenAI-Project": projectId,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: finalInput,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API Error:", err);
      return NextResponse.json(
        { reply: "Server lagi penuh nih bro 😅. Coba sebentar lagi ya 🙏" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap! Ada lagi yang mau ditanyakan?";

    return NextResponse.json({ reply: text });
  } catch (e) {
    console.error("Fatal API Error:", e);
    return NextResponse.json(
      {
        reply: "Server KOJE24 lagi ada gangguan, coba ulang sebentar lagi ya 🙏",
      },
      { status: 500 }
    );
  }
}
