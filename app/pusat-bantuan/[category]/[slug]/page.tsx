// app/pusat-bantuan/[category]/[slug]/page.tsx

"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { helpCategories } from "../../helpCategories"

export default function HelpDetailPage() {
  const params = useParams() as { category: string; slug: string }
  const router = useRouter()

  const { category, slug } = params

  const categoryData = helpCategories[category as keyof typeof helpCategories]
  const item = categoryData?.items.find((it) => it.slug === slug)

  // Kalau kategori atau artikelnya gak ketemu
  if (!categoryData || !item) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold text-[#0B4B50] mb-2">
          Tutorial tidak ditemukan
        </h1>
        <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
          Halaman bantuan yang kamu cari belum tersedia atau sudah dipindahkan.
        </p>

        <button
          onClick={() => router.push("/pusat-bantuan")}
          className="px-5 py-2 rounded-full bg-[#0FA3A8] text-white text-sm font-semibold shadow hover:bg-[#0B8F93] transition"
        >
          Kembali ke Pusat Bantuan
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5fbfb] to-white py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Tombol kembali ke kategori */}
        <button
          onClick={() => router.push(`/pusat-bantuan/${category}`)}
          className="inline-flex items-center gap-2 text-[#0B4B50] hover:text-[#0FA3A8] mb-5 text-sm"
        >
          <ArrowLeft size={18} />
          Kembali ke {categoryData.title}
        </button>

        {/* Header judul */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#0FA3A8] mb-2">
            PANDUAN PUSAT BANTUAN
          </p>

          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B4B50] leading-snug mb-2 font-playfair">
            {item.title}
          </h1>

          <p className="text-sm text-slate-600">
            {item.summary}
          </p>

          <div className="w-24 h-[2px] bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8] rounded-full mt-4" />
        </div>

        {/* Box konten tutorial */}
        <section
          className="
            bg-white border border-[#d7ecec]
            rounded-2xl shadow-sm
            p-5 sm:p-7
            text-sm sm:text-base text-slate-700
            leading-relaxed whitespace-pre-line
          "
        >
          {item.content}
        </section>

        {/* Box bantuan lanjutan */}
        <section className="mt-10">
          <div className="bg-[#f0fbfb] border border-[#d7ecec] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0B4B50] mb-1">
                Masih belum jelas atau butuh bantuan lanjutan?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Kamu bisa chat admin KOJE24, jelaskan kendalamu, dan kami bantu sampai tuntas. 💬
              </p>
            </div>

            <a
              href="https://wa.me/6282213139580"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0FA3A8] text-white text-sm font-semibold shadow hover:bg-[#0B8F93] transition"
            >
              <MessageCircle size={18} />
              Chat Admin KOJE24
            </a>
          </div>
        </section>

        {/* Link balik ke pusat bantuan */}
        <div className="mt-8 text-center">
          <Link
            href="/pusat-bantuan"
            className="text-xs sm:text-sm text-[#0FA3A8] hover:text-[#0B8F93] underline underline-offset-4"
          >
            Lihat topik bantuan lain
          </Link>
        </div>
      </div>
    </main>
  )
}
