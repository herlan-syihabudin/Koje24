import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages)
      ? body.messages
      : [{ role: "user", content: String(body.messages) }];

    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID;
    const projectId = process.env.OPENAI_PROJECT_ID;

    if (!apiKey || !orgId || !projectId) {
      return NextResponse.json(
        { reply: "Server belum dikonfigurasi." },
        { status: 500 }
      );
    }

    // 🔥 SYSTEM yang BENAR-BENAR JADI CS / ADMIN
    const systemPrompt = `
Kamu adalah KOJE24 Assistant.
Gaya bicara:
- Singkat, ramah, manusiawi
- Tidak balik bertanya
- Tidak panjang
- Tidak keluar konteks produk KOJE24

Aturan penting:
- Jawab maksimal 2 kalimat.
- Selalu beri jawaban langsung, jangan menawarkan pilih rasa, jangan bertanya balik.
- Jika user tanya manfaat → langsung sebutkan manfaat varian yang cocok.
- Jika user tanya “best seller” → jawab: Green Detox & Yellow Immunity.
- Jika user tanya soal maag → jawab: Sunrise Fresh.
- Jangan pernah menyebut kamu AI.
- Jangan beri teori kesehatan panjang.
- Fokus hanya pada varian KOJE24.

Mapping varian:
- Maag → Sunrise Fresh
- Detox harian → Green Detox
- Imun → Yellow Immunity
- Darah/stamina → Beetroot Power
- Pencernaan/begah → Celery Cleanse
- Mata & energi → Carrot Boost
    `;

    const lastUserMessage = messages[messages.length - 1].content;

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
        input: `
SYSTEM:
${systemPrompt}

User: ${lastUserMessage}
Assistant:
        `,
      }),
    });

    const data = await response.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap kak, ada yang bisa dibantu lagi?";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Fatal error:", err);
    return NextResponse.json(
      { reply: "Server error, coba sebentar lagi ya 🙏" },
      { status: 500 }
    );
  }
}
