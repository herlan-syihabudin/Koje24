import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "Pesan tidak valid." },
        { status: 400 }
      );
    }

    // ===== ENV =====
    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID;
    const projectId = process.env.OPENAI_PROJECT_ID;

    if (!apiKey || !orgId || !projectId) {
      console.error("Missing ENV =>", { apiKey, orgId, projectId });
      return NextResponse.json(
        { reply: "Server belum lengkap konfigurasinya." },
        { status: 500 }
      );
    }

    // ===== SYSTEM PROMPT (mode dewa) =====
    const systemPrompt = `
Kamu adalah KOJE24 Assistant.
Jawab dengan sangat ramah, singkat, dan jelas.
Fokus pada cold-pressed juice KOJE24, manfaat, rekomendasi varian, cara order, penyimpanan.
Tidak boleh membahas kode atau hal teknis.
Tonjolkan nilai produk tanpa memaksa.
`;

    // ===== GABUNG SEMUA PESAN JADI TEXT (SESUSAI API BARU) =====
    const historyText = messages
      .map((m: any) => `${m.role === "user" ? "User" : "Asisten"}: ${m.content}`)
      .join("\n");

    const finalInput = `
System: ${systemPrompt}

Riwayat percakapan:
${historyText}

Balas sebagai KOJE24 Assistant:
`;

    // ===== CALL RESPONSES API (FORMAT BARU) =====
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Organization": orgId,
        "OpenAI-Project": projectId,
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: finalInput,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI API Error:", errorText);

      return NextResponse.json(
        { reply: "Server lagi sibuk. Coba lagi sebentar ya 🙏" },
        { status: 500 }
      );
    }

    const data = await openaiRes.json();
    const reply = data.output_text ?? "Siap! Ada lagi yang bisa aku bantu?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Fatal Error:", err);

    return NextResponse.json(
      {
        reply:
          "Maaf, server KOJE24 lagi gangguan. Coba beberapa detik lagi ya 🙏",
      },
      { status: 500 }
    );
  }
}
