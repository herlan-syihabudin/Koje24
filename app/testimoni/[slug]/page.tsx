// app/testimoni/[slug]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Testi = {
  timestamp: string
  nama: string
  kota: string
  pesan: string
  rating: number | string
  varian: string
  img?: string
}

export default function TestimoniDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [data, setData] = useState<Testi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const rawSlug = params.slug || ""
        const ts = decodeURIComponent(rawSlug.split("-")[0]) // ambil timestamp di depan

        const res = await fetch("/api/testimonial", { cache: "no-store" })
        const json = await res.json()
        const found = json.find((x: any) => String(x.timestamp) === ts)

        if (found) setData(found)
        else router.replace("/testimoni")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params.slug, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat ulasan...
      </div>
    )
  }

  if (!data) {
    return null
  }

  const rating = Math.min(5, Math.max(1, Number(data.rating) || 5))

  return (
    <section className="min-h-screen bg-[#f6fbfb] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm text-[#0FA3A8] hover:text-[#0B4B50]"
        >
          ← Kembali ke semua testimoni
        </button>

        <article className="bg-white rounded-3xl shadow-[0_16px_60px_rgba(15,163,168,0.15)] p-8 border border-[#e8f2f2]">
          <div className="flex items-center gap-4 mb-5">
            {data.img && (
              <img
                src={data.img}
                alt={data.nama}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#B78F3A]/50"
              />
            )}

            <div className="flex-1">
              <h1 className="font-playfair text-2xl font-semibold text-[#0B4B50]">
                {data.nama}
              </h1>
              <p className="text-sm text-gray-500">{data.kota}</p>
            </div>

            <div className="flex gap-[2px] text-[#B78F3A] text-base">
              {"★".repeat(rating)}
              <span className="text-gray-300">
                {"★".repeat(5 - rating)}
              </span>
            </div>
          </div>

          <p className="inline-block text-[11px] font-semibold tracking-wide uppercase mb-3 px-2.5 py-1 rounded-full bg-[#0FA3A8]/10 text-[#0FA3A8]">
            {data.varian}
          </p>

          <p className="italic text-gray-700 leading-relaxed text-sm md:text-base">
            “{data.pesan}”
          </p>
        </article>
      </div>
    </section>
  )
}
