import { NextResponse } from "next/server"
// ✅ PERBAIKI: Pindahkan helpCategories ke sini (atau buat file terpisah)
// import { helpCategories } from "@/app/pusat-bantuan/helpCategories" // ❌ HAPUS INI

// ✅ TAMBAHKAN DATA HELP CATEGORIES LANGSUNG DI SINI
const helpCategories = {
  produk: {
    name: "Produk",
    items: [
      {
        slug: "green-detox",
        title: "Green Detox - Detox Harian",
        content: "Green Detox adalah jus cold-pressed dari sayuran hijau pilihan yang membantu proses detox alami dan mendukung pencernaan ringan. Cocok dikonsumsi pagi hari.",
        keywords: ["detox", "pencernaan", "green", "sayur"]
      },
      {
        slug: "yellow-immunity",
        title: "Yellow Immunity - Daya Tahan Tubuh",
        content: "Yellow Immunity kaya akan vitamin C dari kunyit, lemon, dan jahe. Membantu meningkatkan daya tahan tubuh dan menjaga kesehatan di musim hujan.",
        keywords: ["imun", "daya tahan", "vitamin", "kuning"]
      },
      {
        slug: "sunrise-fresh",
        title: "Sunrise Fresh - Aman untuk Maag",
        content: "Sunrise Fresh adalah jus dengan rasa yang ringan dan aman untuk lambung. Kombinasi apel, wortel, dan jahe membantu menenangkan sistem pencernaan.",
        keywords: ["maag", "lambung", "asam lambung", "fresh"]
      },
      {
        slug: "beetroot-power",
        title: "Beetroot Power - Stamina & Darah",
        content: "Beetroot Power dari buah bit dan buah-buahan segar membantu meningkatkan stamina, menjaga tekanan darah, dan memperlancar sirkulasi darah.",
        keywords: ["stamina", "darah", "bit", "energi"]
      },
      {
        slug: "celery-cleanse",
        title: "Celery Cleanse - Pencernaan & Begah",
        content: "Celery Cleanse adalah jus seledri dan bahan alami lainnya yang membantu meredakan perut begah, melancarkan pencernaan, dan memberikan rasa segar.",
        keywords: ["seledri", "begah", "pencernaan", "cleanse"]
      },
      {
        slug: "carrot-boost",
        title: "Carrot Boost - Mata & Energi",
        content: "Carrot Boost kaya akan beta-karoten dari wortel yang baik untuk kesehatan mata dan memberikan energi alami untuk memulai hari.",
        keywords: ["wortel", "mata", "energi", "carrot"]
      }
    ]
  },
  pesanan: {
    name: "Pesanan",
    items: [
      {
        slug: "cara-pesan",
        title: "Cara Pemesanan KOJE24",
        content: "1. Pilih produk yang diinginkan\n2. Masukkan ke keranjang belanja\n3. Isi alamat pengiriman\n4. Pilih metode pembayaran\n5. Selesaikan pembayaran\n6. Pesanan akan diproses dan dikirim",
        keywords: ["cara pesan", "order", "beli", "checkout"]
      },
      {
        slug: "pembayaran",
        title: "Metode Pembayaran",
        content: "Kami menerima pembayaran melalui:\n- Transfer Bank (BCA, Mandiri, BNI)\n- QRIS\n- E-Wallet (OVO, Gopay, ShopeePay)\nJika pembayaran gagal tapi saldo terpotong, kirim bukti ke admin.",
        keywords: ["bayar", "transfer", "qris", "ewallet", "invoice"]
      },
      {
        slug: "pengiriman",
        title: "Informasi Pengiriman",
        content: "Pengiriman dilakukan setiap hari Senin-Sabtu pukul 09.00-17.00. Resi pengiriman akan diupdate 5-15 menit setelah barang diambil oleh kurir.",
        keywords: ["kirim", "resi", "kurir", "sampai", "lama"]
      }
    ]
  },
  bantuan: {
    name: "Bantuan",
    items: [
      {
        slug: "refund",
        title: "Kebijakan Refund & Komplain",
        content: "Refund diberikan jika:\n- Produk rusak/cacat\n- Pesanan salah\n- Pengiriman bermasalah\nProses refund maksimal 1x24 jam via admin KOJE24.",
        keywords: ["refund", "komplain", "rusak", "salah", "uang kembali"]
      },
      {
        slug: "kontak",
        title: "Hubungi Kami",
        content: "Butuh bantuan? Hubungi kami melalui:\n- WhatsApp: 0822-1313-9580\n- Email: info@koje24.id\n- Live Chat di website",
        keywords: ["kontak", "hubungi", "cs", "customer service"]
      }
    ]
  }
}

/* ===============================
   HELPER: DETECT INTENT / CONTEXT
================================ */
function detectContext(text: string) {
  const q = text.toLowerCase()

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
    return "help"
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
    return "product"
  }

  return "general"
}

/* ===============================
   HELPER: SEARCH HELP CATEGORIES
================================ */
function findHelpArticle(question: string) {
  const q = question.toLowerCase()

  for (const categoryKey in helpCategories) {
    const category = helpCategories[categoryKey as keyof typeof helpCategories]

    for (const item of category.items) {
      if (
        q.includes(item.slug.replace(/-/g, " ")) ||
        q.includes(item.title.toLowerCase()) ||
        q.includes(categoryKey) ||
        item.keywords?.some(k => q.includes(k))
      ) {
        return {
          title: item.title,
          content: item.content.replace(/##/g, "").trim(),
          url: `/pusat-bantuan/${categoryKey}/${item.slug}`,
        }
      }
    }
  }

  return null
}

/* ===============================
   KNOWLEDGE BASE WEBSITE
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
`

/* ===============================
   API HANDLER
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body.messages)
      ? body.messages
      : [{ role: "user", content: String(body.messages) }]

    const apiKey = process.env.OPENAI_API_KEY
    const orgId = process.env.OPENAI_ORG_ID
    const projectId = process.env.OPENAI_PROJECT_ID

    if (!apiKey || !orgId || !projectId) {
      return NextResponse.json(
        { reply: "Server belum dikonfigurasi." },
        { status: 500 }
      )
    }

    const lastUserMessage = messages[messages.length - 1].content

    /* ==================================================
       1️⃣ PRIORITAS: PUSAT BANTUAN (HARD DATA)
    =================================================== */
    const helpArticle = findHelpArticle(lastUserMessage)

    if (helpArticle) {
      return NextResponse.json({
        reply: `${helpArticle.title}

${helpArticle.content.split("\n").slice(0, 4).join("\n")}

👉 Panduan lengkap: ${helpArticle.url}`,
      })
    }

    /* ==================================================
       2️⃣ FALLBACK: AI (PRODUCT / GENERAL)
    =================================================== */
    const context = detectContext(lastUserMessage)

    let systemPrompt = ""

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
`
    }

    if (context === "general") {
      systemPrompt = `
Kamu adalah KOJE24 Assistant.

Aturan:
- Jawab singkat dan ramah.
- Jangan keluar dari konteks KOJE24.
- Jika pertanyaan mengarah ke kendala teknis → arahkan ke pusat bantuan atau admin.
`
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
SYSTEM:
${systemPrompt}

KNOWLEDGE:
${WEBSITE_KNOWLEDGE}

User: ${lastUserMessage}
Assistant:
        `,
      }),
    })

    const data = await response.json()

    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Siap kak, ada yang bisa dibantu lagi? 😊"

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("AI ERROR:", err)
    return NextResponse.json(
      { reply: "Server sedang sibuk, coba lagi ya 🙏" },
      { status: 500 }
    )
  }
}
