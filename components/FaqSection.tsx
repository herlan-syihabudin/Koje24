export default function FaqSection() {
  const faqs = [
    { q: "Apa itu KOJE24?", a: "Minuman sehat cold-pressed tanpa gula & pengawet, segar harian." },
    { q: "Berapa lama masa simpan jus?", a: "Disarankan 2–3 hari di kulkas (≤4°C). Kocok sebelum diminum." },
    { q: "Apakah bisa kirim ke luar kota?", a: "Untuk sekarang area Jabodetabek. DM/WA untuk pengiriman khusus." },
  ]
  return (
    <section id="faq" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#0B4B50] mb-6">Pertanyaan yang Sering Diajukan</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="bg-white rounded-2xl border border-[#e6eeee] p-4">
              <summary className="cursor-pointer font-semibold text-[#0B4B50]">{f.q}</summary>
              <p className="mt-2 text-[#557577]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
