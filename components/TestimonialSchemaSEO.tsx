"use client"
import { useEffect, useState } from "react"

export default function TestimonialSchemaSEO() {
  const [jsonLD, setJsonLD] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/testimonial", { cache: "no-store" })
        const testi = await res.json()

        const active = testi.filter(
          (t: any) =>
            ["true", "1", "yes", "ya"].includes(String(t.active).toLowerCase())
        )

        if (active.length === 0) return

        const avgRating =
          active.reduce((acc: number, t: any) => acc + Number(t.rating || 0), 0) /
          active.length

        const schema = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "KOJE24 Cold-Pressed Juice",
          brand: "KOJE24",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: active.length,
          },
          review: active.slice(0, 40).map((t: any) => ({
            "@type": "Review",
            author: t.nama,
            reviewBody: t.pesan,
            reviewRating: {
              "@type": "Rating",
              ratingValue: Number(t.rating),
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }

        setJsonLD(JSON.stringify(schema))
      } catch (err) {
        console.error("SEO Schema Error:", err)
      }
    }

    load()
  }, [])

  if (!jsonLD) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLD }}
    />
  )
}
