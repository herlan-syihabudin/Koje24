import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // ====== VALIDASI AWAL ======
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "Input format tidak valid." },
        { status: 400 }
      );
    }

    // ====== AMBIL ENV ======
    const endpoint = "https://api.openai.com/v1/responses";
    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID;
    const projectId = process.env.OPENAI_PROJECT_ID;

    if (!apiKey || !orgId || !projectId) {
      console.log("Env missing:", { apiKey, orgId, projectId });
      return NextResponse.json(
        { reply: "Server kurang konfigurasi env." },
        { status: 500 }
      );
    }

    // ====== SYSTEM PROMPT (LEVEL DEWA) ======
    const systemPrompt = `
Kamu adalah KOJE24 Assistant — ramah, jelas, dan sangat membantu customer.
Jawaban harus:
- pendek, mudah dipahami
- relevan untuk jus, varian, manfaat, pemakaian, order
- tanpa bahas hal teknis atau coding
- selalu promosi halus tanpa maksa
`;

    // ====== PANGGIL OPENAI ======
    const openaiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Organization": orgId,
        "OpenAI-Project": projectId,
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI API Error:", errorText);

      return NextResponse.json(
        { reply: "Server lama merespon, coba beberapa detik lagi ya 🙏" },
        { status: 500 }
      );
    }

    const data = await openaiRes.json();
    const reply = data.output_text || "Oke! Ada yang bisa aku bantu lagi?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Server Fatal Error:", err);
    return NextResponse.json(
      {
        reply:
          "Maaf, server KOJE24 lagi ada kendala. Coba beberapa saat lagi ya 🙏",
        error: String(err),
      },
      { status: 500 }
    );
  }
}
