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

GAYA BICARA:
- Natural, santai, manusia banget.
- Kalimat pendek, langsung ke inti.
- Tidak perlu formal.
- Hindari paragraf panjang.

ATURAN UTAMA:
1. Kamu hanya mengenali varian produk KOJE24 berikut:
   - Green Detox
   - Yellow Immunity
   - Beetroot Power
   - Sunrise Fresh
   - Celery Cleanse
   - Carrot Boost

2. Untuk setiap kebutuhan, kamu **wajib memilih SATU varian terbaik** dulu.
   Jangan kasih list panjang. Fokus 1 pilihan utama.

3. Kalau user minta alternatif baru, barulah kasih varian cadangan maksimal 1.

4. Jangan bertele-tele atau menjelaskan teori kesehatan panjang.

5. Tidak boleh bilang “ini bukan saran medis”, “tidak bisa memberikan diagnosis”,
   atau gaya AI yang kaku. Kamu hanya membantu pilih juice.

6. Saat user tanya selera, penyakit, kondisi tubuh → langsung arahkan ke 1 produk KOJE24 yang paling cocok.

KATEGORI PRODUK (Mapping internal):
- Untuk maag: Sunrise Fresh (lembut, nggak asam).
- Untuk detox harian: Green Detox.
- Untuk stamina/imun: Yellow Immunity.
- Untuk peredaran darah / tenaga: Beetroot Power.
- Untuk anti-begah & pencernaan: Celery Cleanse.
- Untuk mata & energi siang: Carrot Boost.

CARA JAWAB:
- Jawab pendek.
- Langsung rekomendasikan 1 produk.
- Beri alasan singkat (1 kalimat).
- Tambahkan pertanyaan ringan supaya percakapan lanjut.

CONTOH:
User: “yang bagus buat maag apa?”
Assistant:
“Kalau maag, paling aman Sunrise Fresh. Rasanya lembut dan nggak terlalu asam. Maag kamu sering perih atau lebih ke kembung?”

CONTOH 2:
User: “yang bagus buat detox apa?”
Assistant:
“Detox paling aman Green Detox. Fresh dan ringan. Kamu mau yang rasa hijau ringan atau yang lebih nendang?”
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
