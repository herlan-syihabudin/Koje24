import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    const response = await client.responses.create({
      model: "gpt-5.1",   // 🔥 paling kenceng
      input: message,
    });

    return Response.json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return Response.json(
      { error: "Server bermasalah, coba lagi" },
      { status: 500 }
    );
  }
}
