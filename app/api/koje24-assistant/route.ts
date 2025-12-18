import { NextResponse } from "next/server";

/* ===============================
   HELPER: DETECT INTENT / CONTEXT
================================ */
function detectContext(text: string) {
  const q = text.toLowerCase();

  if (
    q.includes("checkout") ||
    q.includes("cara pesan") ||
    q.includes("pembayaran") ||
    q.includes("bayar") ||
    q.includes("invoice") ||
    q.includes("resi") ||
    q.includes("pengiriman") ||
    q.includes("refund") ||
    q.includes("batal") ||
    q.includes("pesanan")
  ) {
    return "help";
  }

  if (
    q.includes("manfaat") ||
    q.includes("varian") ||
    q.includes("jus apa") ||
    q.includes("maag") ||
    q.includes("detox") ||
    q.includes("imun") ||
    q.includes("stamina") ||
    q.includes("pencernaan")
  ) {
    return "product";
  }

  return "general";
}

/* ===============================
   KNOWLEDGE BASE (RINGKAS & VALID)
================================ */
const WEBSITE_KNOWLEDGE = `
PRODUK KOJE24:
- Green Detox: detox harian & pencernaan ringan
- Yellow Immunity: bantu daya tahan tubuh
- Sunrise Fresh: aman untuk lambung & maag
- Beetroot Power: bantu stamina & darah
- Celery Cleanse: pencernaan & begah
- Carrot Boost: mata & energi harian

BEST SELLER:
- Green Detox
- Yellow Immunity

CARA CHECKOUT:
1. Pilih produk
2. Masukkan ke keranjang
3. Isi alamat pengiriman
4. Pilih metode pembayaran
5. Selesaikan pembayaran → pesanan diproses

PEMBAYARAN:
- Transfer Bank
- QRIS
- E-Wallet
Jika pembayaran gagal tapi saldo terpotong → kirim bukti ke admin.

PENGIRIMAN:
- Setiap hari
- Jam 09.00 – 17.00
- Update resi 5–15 menit setelah pickup

REFUND:
- Produk rusak
- Pesanan salah
- Pengiriman bermasalah
Proses maksimal 1×24 jam via admin KOJE24.
`;

/* ===============================
   API HANDLER
================================ */
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

    const lastUserMessage = messages[messages.length - 1].content;
    const context = detectContext(lastUserMessage);

    /* ===============================
       SYSTEM PROMPT DINAMIS
    ================================ */
    let systemPrompt = "";

    if (context === "product") {
      systemPrompt = `
Kamu adalah KOJE24 Product Assistant.

Aturan:
- Fokus menjelaskan produk KOJE24.
- Jawab maksimal 2 kalimat.
- Jangan bertanya balik.
- Jangan menyebut kamu AI.
- Jangan memberi klaim medis.

Mapping:
Maag → Sunrise Fresh
Detox → Green Detox
Imun → Yellow Immunity
Stamina/Darah → Beetroot Power
Pencernaan → Celery Cleanse
Mata/Energi → Carrot Boost
`;
    }

    if (context === "help") {
      systemPrompt = `
Kamu adalah KOJE24 Help Assistant.

Tugas:
- Menjelaskan checkout, pembayaran, pengiriman, refund, dan promo.
- Jawaban HARUS sesuai website KOJE24.
- Jawab singkat, jelas, dan praktis.
- Jangan membahas manfaat kesehatan.
- Jika perlu bantuan lanjutan → arahkan ke admin.
`;
    }

    if (context === "general") {
      systemPrompt = `
Kamu adalah KOJE24 Assistant.

Aturan:
- Jawab singkat dan ramah.
- Jangan keluar dari konteks KOJE24.
- Jika pertanyaan mengarah ke kendala teknis → arahkan ke pusat bantuan atau admin.
`;
    }

    /* ===============================
       CALL OPENAI RESPONSES API
    ================================ */
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

KNOWLEDGE:
${WEBSITE_KNOWLEDGE}

User: ${lastUserMessage}
Assistant:
        `,
      }),
    });

    const data = await response.json();

    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap kak, ada yang bisa dibantu lagi? 😊";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI ERROR:", err);
    return NextResponse.json(
      { reply: "Server sedang sibuk, coba lagi ya 🙏" },
      { status: 500 }
    );
  }
}
