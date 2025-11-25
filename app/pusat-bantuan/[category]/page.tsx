// app/pusat-bantuan/[category]/page.tsx

"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { helpCategories } from "../helpCategories"

export default function CategoryPage() {
  const { category } = useParams()
  const router = useRouter()

  const data = helpCategories[category as keyof typeof helpCategories]

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0B4B50] text-lg">
        Kategori tidak ditemukan.
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5fbfb] to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/pusat-bantuan")}
          className="inline-flex items-center gap-2 text-[#0B4B50] hover:text-[#0FA3A8] mb-6"
        >
          <ArrowLeft size={18} />
          Kembali ke Pusat Bantuan
        </button>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0B4B50] mb-2 font-playfair">
          {data.title}
        </h1>
        <p className="text-sm text-slate-600 mb-8">
          Pilih kendala yang ingin kamu pelajari solusinya.
        </p>

        {/* List Kendala */}
        <div className="space-y-4">
          {data.items.map((item) => (
            <Link
              key={item.slug}
              href={`/pusat-bantuan/${category}/${item.slug}`}
              className="
                group flex items-center justify-between
                p-5 rounded-2xl border border-[#d7ecec] bg-white
                hover:border-[#0FA3A8] hover:shadow-md
                transition-all duration-200
              "
            >
              <div>
                <h2 className="text-[#0B4B50] font-semibold text-base sm:text-lg group-hover:text-[#0FA3A8]">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {item.summary}
                </p>
              </div>

              <ChevronRight
                size={22}
                className="text-[#0FA3A8] opacity-70 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
