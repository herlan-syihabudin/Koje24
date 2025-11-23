import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let { messages } = await req.json();

    if (!messages || typeof messages !== "object") {
      messages = [{ role: "user", content: "Halo" }];
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID;
    const projectId = process.env.OPENAI_PROJECT_ID;

    if (!apiKey || !orgId || !projectId) {
      console.error("❌ MISSING ENV:", { apiKey, orgId, projectId });
      return NextResponse.json(
        { reply: "Server belum siap, ENV belum ada." },
        { status: 500 }
      );
    }

    const systemPersona = `
Kamu adalah KOJE24 Assistant...
    `;

    const finalInput = `
SYSTEM:
${systemPersona}

CHAT:
${messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")}

Balas pendek, natural, manusia banget:
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
      const errText = await response.text();
      console.error("❌ OpenAI API error:", errText);

      return NextResponse.json(
        { reply: "Server KOJE24 lagi penuh bro, coba lagi ya 🙏" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const output =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap bro! Ada lagi mau ditanya?";

    return NextResponse.json({ reply: output });
  } catch (e) {
    console.error("❌ Fatal Error:", e);
    return NextResponse.json(
      {
        reply:
          "Server KOJE24 lagi gangguan, coba ulang sebentar lagi ya 🙏",
      },
      { status: 500 }
    );
  }
}
