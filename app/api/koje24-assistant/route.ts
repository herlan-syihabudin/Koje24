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
      console.error("Missing env");
      return NextResponse.json(
        { reply: "Server belum dikonfigurasi." },
        { status: 500 }
      );
    }

    // ==== PERSONA KOJE24 ====
    const systemPersona = `
Kamu adalah KOJE24 Assistant — admin resmi KOJE24.

GAYA:
- Santai, manusiawi, kayak CS WhatsApp.
- Pendek, inti, nggak bertele-tele.
- Ramah & helpful.

BATASAN:
1. WAJIB hanya bahas KOJE24, varian, manfaat, rasa, order.
2. DILARANG menjawab topik di luar KOJE24.
   Jika user tanya hal lain → jawab sopan:
   "Maaf kak, itu di luar produk KOJE24. Tapi kalau soal juice kita aku bantu banget 😊"

VARIAN RESMI KOJE24:
- Green Detox → detox harian
- Yellow Immunity → stamina & imun
- Beetroot Power → tenaga & peredaran darah
- Sunrise Fresh → aman untuk maag / sensitif
- Celery Cleanse → pencernaan & anti begah
- Carrot Boost → energi & mata

CARA JAWAB:
- Pilih 1 varian terbaik.
- Jelaskan alasan 1 kalimat.
- Lanjutkan dengan 1 pertanyaan ringan.

CONTOH:
User: "buat maag apa?"
Assistant: "Untuk maag aman Sunrise Fresh kak, lembut dan nggak bikin perih. Kak biasanya maag perih atau kembung?"

User: "best seller?"
Assistant: "Green Detox paling sering kejual kak, fresh banget. Kak lebih suka rasa strong atau ringan?"
`;

    // ==== AMBIL PESAN TERAKHIR DARI USER ====
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
${systemPersona}

USER:
${lastUserMessage}

ASSISTANT:
        `,
      }),
    });

    const data = await response.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap kak, ada lagi yang mau ditanya? 😊";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Fatal error:", err);
    return NextResponse.json(
      { reply: "Error server. Coba ulang sebentar lagi ya kak 🙏" },
      { status: 500 }
    );
  }
}
