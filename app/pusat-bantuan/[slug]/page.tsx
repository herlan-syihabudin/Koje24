"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { helpCategories } from "../helpCategories"
import { ArrowLeft, ChevronRight } from "lucide-react"

export default function HelpCategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { slug } = params

  const category = helpCategories[slug]

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-[#0B4B50] mb-2">Topik Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">
          Kategori pusat bantuan yang kamu cari tidak tersedia.
        </p>

        <button
          onClick={() => router.push("/pusat-bantuan")}
          className="px-5 py-2 rounded-full bg-[#0FA3A8] text-white font-semibold shadow hover:bg-[#0B8F93] transition"
        >
          Kembali ke Pusat Bantuan
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6fbfb] to-white pb-16">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">

        <div className="flex items-center gap-2 text-sm text-[#0B4B50] mb-6">
          <button
            onClick={() => router.push("/pusat-bantuan")}
            className="flex items-center text-[#0FA3A8] hover:text-[#0B8F93]"
          >
            <ArrowLeft size={16} className="mr-1" />
            Kembali
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B4B50] mb-2">
          {category.title}
        </h1>

        <p className="text-sm text-slate-600 mb-8">
          {category.description}
        </p>
      </div>

      {/* ARTICLE LIST */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-4">

          {category.articles.map((item) => (
            <Link
              key={item.id}
              href={`/pusat-bantuan/${slug}/${item.id}`}
              className="
                flex items-center justify-between 
                bg-white border border-[#d7ecec] 
                hover:border-[#0FA3A8]/50 
                shadow-xs hover:shadow-md
                transition rounded-xl px-4 py-4
              "
            >
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#0B4B50]">
                  {item.question}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Klik untuk melihat jawaban lengkap
                </p>
              </div>

              <ChevronRight className="text-[#0FA3A8]" size={18} />
            </Link>
          ))}

        </div>
      </section>
    </main>
  )
}
