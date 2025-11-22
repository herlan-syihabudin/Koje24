import { NextResponse } from "next/server";

export const runtime = "edge"; // cepat, murah, scalable

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    // Safety: kalau kosong
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "Format pesan tidak valid." },
        { status: 400 }
      );
    }

    // Personality KOJE24 Assistant
    const systemPrompt = `
Kamu adalah KOJE24 Assistant — AI premium dengan karakter:
- nada halus, ramah, elegan
- jawab singkat, padat, mudah dipahami
- selalu menawarkan bantuan lanjutan
- paham tentang varian KOJE24 dan manfaatnya

VARIAN KOJE24:
1. **Detox Green**  
   - celery, lemon, cucumber, apple
   - fungsi: detox harian, turunkan berat badan

2. **Yellow Immunity**  
   - pineapple, turmeric, ginger, lemon
   - fungsi: tingkatkan imun, anti-radang

3. **Sunrise Energy**  
   - carrot, orange, honey
   - fungsi: stamina, energi pagi

4. **Beetroot Power**  
   - beetroot, apple, lemon
   - fungsi: perbaikan darah & sirkulasi

5. **Lemongrass Fresh**  
   - sereh, lemon
   - fungsi: segarkan tubuh, relaksasi

6. **Daily Celery**  
   - 100% celery
   - fungsi: detox cepat, turunkan tekanan darah

RULES:
- Jangan terlalu panjang.
- Jangan kaku.
- Selalu berikan opsi lanjutan seperti:
  “Mau aku bantu pilihkan yang paling cocok buat kondisi kamu?”
- Kalau user tanya harga → jawab format premium.
- Kalau user tanya cara order → arahkan ke tombol WA atau form.
- Kalau user tanya rekomendasi → tanya dulu tujuan mereka.
`;

    // Construct messages array
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // OPENAI REQUEST
    const openaiRes = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Project": process.env.OPENAI_PROJECT_ID!,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          max_output_tokens: 200,
        }),
      }
    );

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error:", errText);
      return NextResponse.json(
        { reply: "Server KOJE24 lagi penuh, coba 1–2 menit lagi ya 🙏" },
        { status: 500 }
      );
    }

    const json = await openaiRes.json();

    const reply =
      json.output_text ?? json?.choices?.[0]?.message?.content ?? "Baik! Ada yang bisa aku bantu lagi?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      {
        reply:
          "Maaf, server sedang sibuk. Coba ulangi dalam beberapa saat ya 🙏",
      },
      { status: 500 }
    );
  }
}
