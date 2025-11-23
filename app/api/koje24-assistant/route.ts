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
Kamu adalah KOJE24 Assistant. Jawab santai, manusiawi, kalimat pendek.
User: ${messages[messages.length - 1].content}
Assistant:
        `,
      }),
    });

    const data = await response.json();

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap bro, ada lagi mau ditanya?";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Fatal error:", err);
    return NextResponse.json(
      { reply: "Error server. Coba sebentar lagi ya 🙏" },
      { status: 500 }
    );
  }
}
