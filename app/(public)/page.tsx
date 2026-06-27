// app/(public)/page.tsx (SERVER COMPONENT)

import { Metadata } from "next"
import { Suspense } from "react"
import dynamic from 'next/dynamic' // ✅ TAMBAHKAN INI

// ✅ KOMPONEN YANG LANGSUNG DITAMPILKAN (TIDAK PERLU LAZY)
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
import AnimateOnScroll from "@/components/AnimateOnScroll"

// ✅ DYNAMIC IMPORT UNTUK KOMPONEN DI BAWAH FOLD
const FeaturedProducts = dynamic(
  () => import("@/components/FeaturedProducts"),
  { 
    loading: () => <div className="h-32 flex items-center justify-center">Memuat produk unggulan...</div>,
    ssr: true // Tetap SSR untuk SEO
  }
)

const ProductGrid = dynamic(
  () => import("@/components/ProductGrid"),
  { 
    loading: () => <div className="h-32 flex items-center justify-center">Memuat daftar produk...</div>,
    ssr: true
  }
)

const AboutSection = dynamic(
  () => import("@/components/AboutSection"),
  { 
    loading: () => <div className="h-16" />,
    ssr: true
  }
)

const PackagesSection = dynamic(
  () => import("@/components/PackagesSection"),
  { 
    loading: () => <div className="h-16" />,
    ssr: true
  }
)

const SubscriptionSection = dynamic(
  () => import("@/components/SubscriptionSection"),
  { 
    loading: () => <div className="h-16" />,
    ssr: false // Matikan SSR karena tidak kritis untuk SEO
  }
)

const TestimonialsCarousel = dynamic(
  () => import("@/components/TestimonialsCarousel"),
  { 
    loading: () => <div className="h-32 flex items-center justify-center">Memuat testimoni...</div>,
    ssr: false // Matikan SSR karena konten user-generated
  }
)

const FaqSection = dynamic(
  () => import("@/components/FaqSection"),
  { 
    loading: () => <div className="h-16" />,
    ssr: false // FAQ tidak perlu SSR
  }
)

// ✅ POPUP TETAP LAZY (SUDAH BAIK)
const CartPopup = dynamic(
  () => import("@/components/CartPopup"),
  { ssr: false }
)

const PackagePopup = dynamic(
  () => import("@/components/PackagePopup"),
  { ssr: false }
)

const RatingPopup = dynamic(
  () => import("@/components/RatingPopup"),
  { ssr: false }
)

// ... metadata dan schema tetap sama

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
        <SubscriptionSection />
      </section>

      {/* SECTION TESTIMONI */}
      <section id="testimoni" aria-label="Testimoni Pelanggan">
        <TestimonialsCarousel />
      </section>

      <FaqSection />

      {/* POPUP */}
      <Suspense fallback={null}>
        <CartPopup />
        <PackagePopup />
        <RatingPopup />
      </Suspense>
    </>
  )
}
