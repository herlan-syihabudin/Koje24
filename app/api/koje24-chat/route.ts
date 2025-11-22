import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: "Pesannya kurang lengkap." }, { status: 400 });
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
Gaya bicara: singkat, jelas, premium, ramah, dan tidak bertele-tele.

ATURAN WAJIB:
- Jawab MAKSIMAL 2–3 kalimat saja.
- Jangan memberi penjelasan panjang tanpa diminta.
- Kalau user cuma menyapa ("halo", "hi", "pagi"), balas pendek 
  misalnya: "Halo! Ada yang bisa aku bantu?".
- Jangan memberi rekomendasi sebelum user menyebutkan tujuannya.
- Fokus hanya ke produk KOJE24: manfaat, varian, cara order, penyimpanan, dsb.
- Jangan menjelaskan hal di luar itu.

Peran: Expert asistensi cold-pressed juice premium.
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
        model: "gpt-5.1",
        input: finalInput,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API Error:", err);

      return NextResponse.json(
        {
          reply:
            "Maaf, server lagi penuh nih bro 😅. Coba beberapa saat lagi ya 🙏",
        },
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
        reply:
          "Waduh… server lagi gangguan nih. Coba ulang beberapa saat lagi ya 🙏",
      },
      { status: 500 }
    );
  }
}
