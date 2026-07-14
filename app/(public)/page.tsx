// app/(public)/page.tsx (SERVER COMPONENT)

import { Metadata } from "next"
import { Suspense } from "react"
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import FeaturedProducts from "@/components/FeaturedProducts"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import FaqSection from "@/components/FaqSection"
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"
import RatingPopup from "@/components/RatingPopup"

// ⭐ METADATA UNTUK HOME PAGE (OPTIMASI SEO KILLER)
export const metadata: Metadata = {
  title: "KOJE24 - Cold Pressed Juice Bekasi & Jakarta - 100% Natural",
  description: "Cold-pressed juice segar 100% alami tanpa gula tambahan. Detox harian, booster imun, dan energi alami. Delivery Bekasi & Jakarta. Pesan sekarang!",
  keywords: [
    "cold pressed juice Bekasi",
    "jus detox Bekasi",
    "jus sehat tanpa gula",
    "KOJE24",
    "minuman detox alami",
    "cold pressed juice Jakarta",
    "jus segar Bekasi",
    "minuman sehat alami",
    "cold pressed juice Indonesia",
    "jus detox Jakarta",
    "jus sehat Bekasi",
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
    title: "KOJE24 - Cold Pressed Juice Bekasi & Jakarta - 100% Natural",
    description: "Jus detox tanpa gula, cold-pressed, fresh daily. Delivery Bekasi & Jakarta. 100% Natural, No Sugar Added!",
    url: "https://koje24.com",
    siteName: "KOJE24",
    images: [
      {
        url: "https://koje24.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KOJE24 Cold Pressed Juice - Minuman Detox Alami Bekasi",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOJE24 - Cold Pressed Juice Bekasi & Jakarta",
    description: "Jus detox tanpa gula, cold-pressed, fresh daily. Delivery Bekasi & Jakarta.",
    images: ["https://koje24.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://koje24.com",
  },
};

// ✅ PRODUCT SCHEMA - Ambil dari API agar dinamis
// Fungsi ini dijalankan di server saat build
async function getProductsFromAPI() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://koje24.com"
    const res = await fetch(`${baseUrl}/api/master-produk`, { 
      cache: "force-cache",
      next: { revalidate: 3600 } // Revalidate tiap 1 jam
    })
    if (!res.ok) return []
    const data = await res.json()
    return data?.success ? data.products : []
  } catch (error) {
    console.error("Error fetching products for schema:", error)
    return []
  }
}

// ✅ BUILD TIME: Generate product schemas dari API
async function generateProductSchemas() {
  const products = await getProductsFromAPI()
  
  // Filter hanya produk aktif dan bukan paket
  const activeProducts = products.filter((p: any) => 
    p.aktif === "YES" && !p.isPackage
  )
  
  return activeProducts.map((product: any) => ({
    id: product.id,
    name: product.nama,
    description: product.desc || product.slogan || "",
    price: product.harga,
    image: product.img,
  }))
}

export default async function HomePage() {
  // ✅ Ambil product schemas dari API
  const productSchemas = await generateProductSchemas()
  
  // ✅ Fallback jika API gagal
  const fallbackSchemas = [
    {
      id: "red-vitality",
      name: "Red Vitality",
      description: "Natural Strength from Within. Bit • Nanas • Apel. Booster stamina alami.",
      price: 18000,
      image: "https://koje24.com/images/red-vitality.webp",
    },
    {
      id: "golden-detox",
      name: "Golden Detox",
      description: "Clean Your Body, Boost Your Day. Kunyit • Wortel • Jahe • Jeruk • Lemon.",
      price: 18000,
      image: "https://koje24.com/images/golden-detox.webp",
    },
    {
      id: "green-revive",
      name: "Green Revive",
      description: "Fresh Green Energy in Every Sip. Pakcoy • Nanas • Timun.",
      price: 18000,
      image: "https://koje24.com/images/green-revive.webp",
    },
    {
      id: "sunrise-boost",
      name: "Sunrise Boost",
      description: "Start Your Day with Natural Power. Wortel • Apel • Tomat.",
      price: 18000,
      image: "https://koje24.com/images/sunrise-boost.webp",
    },
    {
      id: "lemongrass-fresh",
      name: "Lemongrass Fresh",
      description: "Calm. Fresh. Naturally Bright. Lemon • Serai.",
      price: 18000,
      image: "https://koje24.com/images/lemongrass-fresh.webp",
    },
    {
      id: "yellow-immunity",
      name: "Yellow Immunity",
      description: "Stronger Immunity, Brighter Day. Nanas • Lemon.",
      price: 18000,
      image: "https://koje24.com/images/yellow-immunity.webp",
    },
  ]

  const schemas = productSchemas.length > 0 ? productSchemas : fallbackSchemas

  return (
    <>
      {/* ⭐ SCHEMA ITEMLIST UNTUK PRODUK (Dinamis dari API) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Produk KOJE24",
            description: "Daftar produk cold pressed juice alami",
            numberOfItems: schemas.length,
            itemListElement: schemas.map((product: any, index: number) => ({
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
