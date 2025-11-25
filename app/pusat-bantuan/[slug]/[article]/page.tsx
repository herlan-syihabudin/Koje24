"use client"

import { useRouter } from "next/navigation"
import { helpCategories } from "../../helpCategories"
import { ArrowLeft } from "lucide-react"

export default function HelpArticlePage({
  params,
}: {
  params: { slug: string; article: string }
}) {
  const router = useRouter()
  const { slug, article } = params

  const category = helpCategories[slug]
  const articleData = category?.articles.find((a) => a.id === article)

  // Jika kategori atau artikel tidak ditemukan
  if (!category || !articleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-[#0B4B50] mb-2">
          Artikel Tidak Ditemukan
        </h1>
        <p className="text-gray-500 mb-6">
          Artikel bantuan yang kamu cari tidak tersedia.
        </p>

        <button
          onClick={() => router.push("/pusat-bantuan")}
          className="px-5 py-2 rounded-full bg-[#0FA3A8] text-white font-semibold shadow hover:bg-[#0B8F93]"
        >
          Kembali ke Pusat Bantuan
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6fbfb] to-white pb-20">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <button
          onClick={() => router.push(`/pusat-bantuan/${slug}`)}
          className="flex items-center text-[#0FA3A8] hover:text-[#0B8F93] mb-4 text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Kembali ke {category.title}
        </button>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B4B50] leading-snug mb-3">
          {articleData.question}
        </h1>

        <p className="text-sm text-slate-500 mb-6 capitalize">
          Kategori: {category.title}
        </p>

        <div className="w-20 h-[2px] bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] rounded-full mb-6" />
      </div>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div
          className="
            bg-white 
            border border-[#d7ecec] 
            rounded-2xl 
            shadow-sm 
            p-6 sm:p-8 
            text-slate-700 
            leading-relaxed 
            whitespace-pre-line
          "
        >
          {articleData.answer}
        </div>
      </section>
    </main>
  )
}
