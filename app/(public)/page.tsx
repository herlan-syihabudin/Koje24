// app/(public)/page.tsx (SERVER COMPONENT)

import { Metadata } from "next"
import { Suspense } from "react"
import dynamic from 'next/dynamic'

// ✅ KOMPONEN YANG TETAP SSR (tanpa ssr: false)
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
import AnimateOnScroll from "@/components/AnimateOnScroll"

// ✅ IMPORT CLIENT COMPONENTS (yang berisi ssr: false)
import { ClientComponents } from "./ClientComponents"

// ✅ DYNAMIC IMPORT TANPA ssr: false
const FeaturedProducts = dynamic(
  () => import("@/components/FeaturedProducts"),
  { 
    loading: () => <div className="h-32 flex items-center justify-center">Memuat produk unggulan...</div>,
    // ✅ HAPUS ssr: false, defaultnya true
  }
)

const ProductGrid = dynamic(
  () => import("@/components/ProductGrid"),
  { 
    loading: () => <div className="h-32 flex items-center justify-center">Memuat daftar produk...</div>,
  }
)

const AboutSection = dynamic(
  () => import("@/components/AboutSection"),
  { 
    loading: () => <div className="h-16" />,
  }
)

const PackagesSection = dynamic(
  () => import("@/components/PackagesSection"),
  { 
    loading: () => <div className="h-16" />,
  }
)

// ✅ METADATA tetap sama
export const metadata: Metadata = {
  // ... metadata Anda
}

// ✅ SCHEMA PRODUCT tetap sama
const productSchemas = [
  // ... data produk
]

export default function HomePage() {
  return (
    <>
      {/* SCHEMA tetap sama */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Produk KOJE24",
            description: "Daftar produk cold pressed juice alami",
            numberOfItems: productSchemas.length,
            itemListElement: productSchemas.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                "url": `https://koje24.com/produk/${product.id}`,
                "name": product.name,
                "description": product.description,
                "image": product.image,
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": 5.0,
                  "reviewCount": 11
                },
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "IDR",
                  "availability": "https://schema.org/InStock"
                },
              },
            })),
          }),
        }}
      />

      {/* RENDER KOMPONEN */}
      <PromoBanner />
      <Hero />

      {/* SECTION PRODUK */}
      <section id="produk" aria-label="Produk KOJE24">
        <AnimateOnScroll direction="up">
          <FeaturedProducts />
        </AnimateOnScroll>

        <Suspense fallback={<div className="text-center py-10">Memuat produk...</div>}>
          <ProductGrid />
        </Suspense>
      </section>

      {/* SECTION TENTANG KAMI */}
      <section id="about" aria-label="Tentang KOJE24">
        <AboutSection />
      </section>

      {/* SECTION LANGGANAN */}
      <section id="langganan" aria-label="Paket Langganan">
        <PackagesSection />
        {/* ✅ ClientComponents sudah include SubscriptionSection */}
      </section>

      {/* SECTION TESTIMONI */}
      <section id="testimoni" aria-label="Testimoni Pelanggan">
        {/* ✅ ClientComponents sudah include TestimonialsCarousel */}
      </section>

      {/* ✅ ClientComponents sudah include FaqSection dan Popup */}
      <ClientComponents />
    </>
  )
}
