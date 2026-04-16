// app/testimoni/[slug]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"

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
        // Ambil timestamp dari awal slug (lebih robust)
        const ts = decodeURIComponent(rawSlug.split("-")[0])
        
        if (!ts) {
          router.replace("/testimoni")
          return
        }

        const res = await fetch("/api/testimonial", { cache: "no-store" })
        const json = await res.json()
        
        // Cari berdasarkan timestamp (string comparison lebih aman)
        const found = json.find((x: any) => String(x.timestamp) === String(ts))

        if (found) {
          setData(found)
        } else {
          router.replace("/testimoni")
        }
      } catch (error) {
        console.error("Error loading testimoni:", error)
        router.replace("/testimoni")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params.slug, router])

  // Loading state dengan skeleton
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#f6fbfb] pt-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
              <div className="bg-white rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded" />
                  <div className="h-4 w-4/6 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!data) {
    return null
  }

  const rating = Math.min(5, Math.max(1, Number(data.rating) || 5))
  const initials = (data.nama || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-[#f6fbfb] py-16 pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm text-[#0FA3A8] hover:text-[#0B4B50] transition-colors inline-flex items-center gap-1"
          >
            ← Kembali ke semua testimoni
          </button>

          <article className="bg-white rounded-3xl shadow-[0_16px_60px_rgba(15,163,168,0.15)] p-6 md:p-8 border border-[#e8f2f2]">
            <div className="flex items-center gap-4 mb-5">
              {data.img ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#0FA3A8]/30">
                  <Image
                    src={data.img}
                    alt={data.nama}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#0FA3A8]/10 flex items-center justify-center text-xl font-semibold text-[#0B4B50] border-2 border-[#0FA3A8]/30">
                  {initials}
                </div>
              )}

              <div className="flex-1">
                <h1 className="font-playfair text-xl md:text-2xl font-semibold text-[#0B4B50]">
                  {data.nama}
                </h1>
                <p className="text-sm text-gray-500">{data.kota}</p>
              </div>

              <div className="flex gap-[2px] text-[#E8C46B] text-base">
                {"★".repeat(rating)}
                <span className="text-gray-300">
                  {"★".repeat(5 - rating)}
                </span>
              </div>
            </div>

            <p className="inline-block text-[11px] font-semibold tracking-wide uppercase mb-4 px-3 py-1 rounded-full bg-[#0FA3A8]/10 text-[#0FA3A8]">
              {data.varian}
            </p>

            <p className="italic text-gray-700 leading-relaxed text-sm md:text-base">
              “{data.pesan}”
            </p>

            {/* Tambahan: timestamp */}
            <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
              Ditulis pada: {new Date(data.timestamp).toLocaleDateString("id-ID")}
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
