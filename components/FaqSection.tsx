"use client"

// app/components/FaqSection.tsx (SERVER COMPONENT - TANPA "use client"!)
import Script from "next/script";

export default function FaqSection() {
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6282213139580";
  
  const faqs = [
    {
      q: "Apa itu KOJE24?",
      a: "KOJE24 adalah minuman sehat cold-pressed alami tanpa gula tambahan dan tanpa pengawet. Dibuat dari bahan segar pilihan setiap hari untuk menjaga keseimbangan tubuh, energi, dan kesehatan kulit.",
      category: "produk"
    },
    {
      q: "Berapa lama masa simpan jus KOJE24?",
      a: "Disarankan dikonsumsi maksimal 2–3 hari setelah produksi dan disimpan di dalam kulkas pada suhu ≤4°C. Kocok perlahan sebelum diminum untuk menjaga rasa dan kualitas alami.",
      category: "produk"
    },
    {
      q: "Apakah bisa dikirim ke luar kota?",
      a: "Saat ini pengiriman rutin tersedia untuk area Jabodetabek. Untuk area di luar kota, silakan hubungi kami via WhatsApp agar tim kami bisa bantu atur pengiriman khusus dengan pendingin.",
      category: "pengiriman"
    },
    {
      q: "Apakah aman untuk anak-anak dan ibu hamil?",
      a: "Ya, semua varian KOJE24 dibuat dari bahan alami tanpa tambahan kimia berbahaya. Namun, bagi ibu hamil disarankan konsultasi ke dokter bila memiliki kondisi kesehatan khusus.",
      category: "keamanan"
    },
    {
      q: "Apakah ada minimum order untuk paket langganan?",
      a: "Tidak ada minimum khusus. Kamu bisa mulai dari 1 botol, atau pilih paket 7, 14, hingga 30 hari agar lebih hemat dan praktis untuk konsumsi harian.",
      category: "order"
    },
  ];

  // FAQ Schema untuk SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section
        id="faq"
        className="relative bg-gradient-to-b from-[#f8fcfc] to-[#eef7f7] py-24 overflow-hidden"
        aria-label="Frequently Asked Questions"
      >
        {/* Background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(15,163,168,0.07),transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#0B4B50] mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="font-inter text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Temukan jawaban seputar <b>KOJE24</b> — mulai dari penyimpanan, manfaat, hingga cara pemesanan 🍃
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-[#e6eeee]/60 p-5 shadow-[0_5px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(15,163,168,0.1)] transition-all duration-300"
                open={i === 0} // FAQ pertama default terbuka
              >
                <summary className="cursor-pointer font-semibold text-[#0B4B50] flex justify-between items-center list-none">
                  <span className="flex items-center gap-2">
                    {/* Category indicator (optional) */}
                    {f.category === "produk" && <span className="text-xs bg-[#0FA3A8]/10 text-[#0FA3A8] px-2 py-0.5 rounded-full">Produk</span>}
                    {f.q}
                  </span>
                  <span className="ml-3 text-[#0FA3A8] text-xl transform transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[#557577] leading-relaxed text-[15px]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="font-inter text-gray-600 text-base md:text-lg leading-relaxed">
              Masih ada pertanyaan lain?{" "}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                className="text-[#0FA3A8] font-semibold hover:text-[#0DC1C7] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hubungi tim KOJE24 →
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
