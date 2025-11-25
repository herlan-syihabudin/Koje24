"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { helpCategories } from "../../helpCategories"
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Copy,
  MessageCircle,
} from "lucide-react"

export default function HelpArticlePage({
  params,
}: {
  params: { slug: string; article: string }
}) {
  const router = useRouter()
  const { slug, article } = params

  const category = helpCategories[slug]
  const articles = category?.articles || []
  const articleIndex = articles.findIndex((a) => a.id === article)
  const articleData = articles[articleIndex]

  // Jika tidak ditemukan
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

  // Auto scroll halus
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 80, behavior: "smooth" })
    }, 150)
  }, [])

  // Share link
  function shareToWA() {
    const url = window.location.href
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank")
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    alert("Link artikel disalin!")
  }

  const prevArticle = articles[articleIndex - 1]
  const nextArticle = articles[articleIndex + 1]

  const relatedArticles = articles.filter((a) => a.id !== article).slice(0, 4)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6fbfb] to-white pb-20 pt-4">

      {/* Back button */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-4">
        <button
          onClick={() => router.push(`/pusat-bantuan/${slug}`)}
          className="flex items-center text-[#0FA3A8] hover:text-[#0B8F93] mb-4 text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Kembali ke {category.title}
        </button>
      </div>

      {/* TITLE */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B4B50] leading-snug mb-3">
          {articleData.question}
        </h1>

        <p className="text-sm text-slate-500 mb-6 capitalize">
          Kategori • {category.title}
        </p>

        <div className="w-20 h-[2px] bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] rounded-full mb-6" />
      </div>

      {/* ARTICLE BOX */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div
          className="
            bg-white border border-[#d7ecec]
            rounded-2xl shadow-sm
            p-6 sm:p-8 text-slate-700
            leading-relaxed whitespace-pre-line
          "
        >
          {articleData.answer}
        </div>
      </section>

      {/* SHARE */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4 flex gap-3">
        <button
          onClick={shareToWA}
          className="flex items-center gap-2 px-4 py-2 bg-[#f0fbfb] border border-[#d7ecec] rounded-full text-sm text-[#0B4B50] hover:bg-[#e4f7f7] transition"
        >
          <Share2 size={16} /> Bagikan
        </button>

        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 bg-[#f0fbfb] border border-[#d7ecec] rounded-full text-sm text-[#0B4B50] hover:bg-[#e4f7f7] transition"
        >
          <Copy size={16} /> Salin Link
        </button>
      </div>

      {/* RELATED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
        <h2 className="text-lg font-semibold text-[#0B4B50] mb-3">
          Pertanyaan Terkait
        </h2>

        <div className="space-y-2">
          {relatedArticles.map((item) => (
            <Link
              key={item.id}
              href={`/pusat-bantuan/${slug}/${item.id}`}
              className="block p-4 rounded-xl border border-[#d7ecec] hover:border-[#0FA3A8]/50 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="font-medium text-[#0B4B50]">{item.question}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* PREV / NEXT */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 flex justify-between">

        {prevArticle ? (
          <Link
            href={`/pusat-bantuan/${slug}/${prevArticle.id}`}
            className="flex items-center gap-2 text-[#0FA3A8] hover:text-[#0B8F93] text-sm"
          >
            <ArrowLeft size={16} /> {prevArticle.question}
          </Link>
        ) : (
          <div />
        )}

        {nextArticle && (
          <Link
            href={`/pusat-bantuan/${slug}/${nextArticle.id}`}
            className="flex items-center gap-2 text-[#0FA3A8] hover:text-[#0B8F93] text-sm"
          >
            {nextArticle.question} <ArrowRight size={16} />
          </Link>
        )}
      </section>

      {/* NEED HELP BOX */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-[#f0fbfb] border border-[#d7ecec] p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-[#0B4B50] mb-1">
            Masih butuh bantuan?
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Tim KOJE24 siap membantu menjawab pertanyaanmu.
          </p>

          <a
            href="https://wa.me/6282213139580"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0FA3A8] text-white text-sm font-semibold hover:bg-[#0B8F93] shadow transition"
          >
            <MessageCircle size={18} /> Chat KOJE24
          </a>
        </div>
      </section>
    </main>
  )
}
