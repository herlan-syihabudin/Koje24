// app/components/TestimonialSchemaSEO.tsx
// ✅ SUDAH DIPERBAIKI

import { cache } from 'react'

interface Testimonial {
  nama: string;
  pesan: string;
  rating: number | string;
  active: string | boolean;
}

interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  brand: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: number;
  };
  review?: Array<{
    "@type": "Review";
    author: {
      "@type": "Person";  // ✅ HARUS OBJECT, BUKAN STRING
      name: string;
    };
    reviewBody: string;
    reviewRating: {
      "@type": "Rating";
      ratingValue: number;
      bestRating: number;
      worstRating: number;
    };
  }>;
}

// Cache fetch untuk performance
const getTestimonials = cache(async () => {
  try {
    // Gunakan API_URL absolut untuk server component
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://webkoje24.vercel.app'
    const res = await fetch(`${baseUrl}/api/testimonial`, {
      cache: 'force-cache',  // Cache di server
      next: { revalidate: 3600 } // Revalidate tiap jam
    })
    
    if (!res.ok) return []
    return await res.json() as Testimonial[]
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return []
  }
})

export default async function TestimonialSchemaSEO() {
  const testimonials = await getTestimonials()
  
  // Filter active testimonials
  const active = testimonials.filter((t) =>
    ["true", "1", "yes", "ya"].includes(String(t.active).toLowerCase())
  )

  if (active.length === 0) return null

  // Filter valid ratings
  const validRatings = active
    .map(t => Number(t.rating))
    .filter(r => !isNaN(r) && r >= 1 && r <= 5)

  if (validRatings.length === 0) return null

  // Calculate average
  const avgRating = validRatings.reduce((acc, r) => acc + r, 0) / validRatings.length

  // Build schema dengan author yang bener
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "KOJE24 Cold-Pressed Juice",
    "brand": "KOJE24",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": active.length,
    },
    "review": active.slice(0, 40).map((t) => ({
      "@type": "Review",
      "author": {                        // ✅ SEKARANG JADI OBJECT
        "@type": "Person",               // ✅ TYPE "Person"
        "name": t.nama || "Pelanggan KOJE24"
      },
      "reviewBody": t.pesan || "Produk berkualitas, sangat segar!",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": Number(t.rating) || 5,
        "bestRating": 5,
        "worstRating": 1,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
