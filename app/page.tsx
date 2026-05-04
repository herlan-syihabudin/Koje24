// app/page.tsx (SERVER COMPONENT)

import { Metadata } from "next"
import { Suspense, lazy } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import FeaturedProducts from "@/components/FeaturedProducts"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import PackagesSection from "@/components/PackagesSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import FaqSection from "@/components/FaqSection"

// ⭐ DYNAMIC IMPORTS (LOAD HANYA KETIKA DIBUTUHKAN)
const CartPopup = dynamic(() => import("@/components/CartPopup"), {
  ssr: false,
  loading: () => null
})

const PackagePopup = dynamic(() => import("@/components/PackagePopup"), {
  ssr: false,
  loading: () => null
})

const RatingPopup = dynamic(() => import("@/components/RatingPopup"), {
  ssr: false,
  loading: () => null
})

// ⭐ ChatWidget juga di-dynamic (gak nge-blok render awal)
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), {
  ssr: false,
  loading: () => null
})

// ⭐ METADATA YANG LEBIH KAYA UNTUK SEO
export const metadata: Metadata = {
  title: {
    default: "KOJE24 - Cold Pressed Juice Jakarta & Tangerang",
    template: "%s | KOJE24",
  },
  description:
    "Cold-pressed juice segar 100% alami tanpa gula tambahan. Detox harian, booster imun, dan energi alami. Delivery Jakarta, Bekasi, Tangerang.",
  keywords: [
    "cold pressed juice Jakarta",
    "jus detox Tangerang",
    "jus sehat tanpa gula",
    "KOJE24",
    "minuman detox alami",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "KOJE24 - Cold Pressed Juice Sehat Alami",
    description:
      "Jus detox tanpa gula, cold-pressed, fresh daily. Delivery Jakarta, Bekasi, Tangerang.",
    url: "https://koje24.com",
    siteName: "KOJE24",
    images: [
      {
        url: "https://koje24.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KOJE24 Cold Pressed Juice",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOJE24 - Cold Pressed Juice Sehat Alami",
    description:
      "Jus detox tanpa gula, cold-pressed, fresh daily. Delivery Jakarta, Bekasi, Tangerang.",
    images: ["https://koje24.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://koje24.com",
  },
}

// ⭐ TAMBAHKAN PRODUCT SCHEMA UNTUK HOME PAGE
const productSchemas = [
  {
    id: "red-vitality",
    name: "Red Vitality",
    description:
      "Natural Strength from Within. Bit • Nanas • Apel. Booster stamina alami.",
    price: 18000,
    image: "https://koje24.com/images/red-vitality.webp",
  },
  {
    id: "golden-detox",
    name: "Golden Detox",
    description:
      "Clean Your Body, Boost Your Day. Kunyit • Wortel • Jahe • Jeruk • Lemon.",
    price: 18000,
    image: "https://koje24.com/images/golden-detox.webp",
  },
  {
    id: "green-revive",
    name: "Green Revive",
    description:
      "Fresh Green Energy in Every Sip. Pakcoy • Nanas • Timun.",
    price: 18000,
    image: "https://koje24.com/images/green-revive.webp",
  },
  {
    id: "sunrise-boost",
    name: "Sunrise Boost",
    description:
      "Start Your Day with Natural Power. Wortel • Apel • Tomat.",
    price: 18000,
    image: "https://koje24.com/images/sunrise-boost.webp",
  },
  {
    id: "lemongrass-fresh",
    name: "Lemongrass Fresh",
    description:
      "Calm. Fresh. Naturally Bright. Lemon • Serai.",
    price: 18000,
    image: "https://koje24.com/images/lemongrass-fresh.webp",
  },
  {
    id: "yellow-immunity",
    name: "Yellow Immunity",
    description:
      "Stronger Immunity, Brighter Day. Nanas • Lemon.",
    price: 18000,
    image: "https://koje24.com/images/yellow-immunity.webp",
  },
]

export default function HomePage() {
  return (
    <>
      {/* ⭐ SCHEMA UNTUK SEO RICH RESULTS */}
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

      {/* ⭐ RENDER KOMPONEN */}
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

      {/* ⭐ SEMUA POPUP & CHAT DI-DYNAMIC IMPORT (GAK NGE-BLOCK RENDER) */}
      <Suspense fallback={null}>
        <CartPopup />
        <PackagePopup />
        <RatingPopup />
        <ChatWidget />
      </Suspense>
    </>
  )
}
