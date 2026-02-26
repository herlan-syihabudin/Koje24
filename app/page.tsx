"use client";

import { Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// 🔥 METADATA UNTUK SEO (pake Next.js App Router)
export const metadata = {
  title: "KOJE24 - Natural Cold-Pressed Juice Segar Setiap Hari",
  description: "Nikmati kesegaran jus cold-pressed alami tanpa pengawet. Berbagai pilihan paket langganan juice untuk gaya hidup sehatmu. Delivery Jakarta & Tangerang.",
  keywords: "cold pressed juice, jus segar, healthy drink, jus detoks, juice jakarta, minuman sehat, cold pressed jakarta",
  openGraph: {
    title: "KOJE24 - Natural Cold-Pressed Juice",
    description: "Jus cold-pressed alami, dikirim segar setiap hari",
    images: [
      {
        url: "/og-image.jpg",
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
    title: "KOJE24 - Natural Cold-Pressed Juice",
    description: "Jus cold-pressed alami, dikirim segar setiap hari",
    images: ["/og-image.jpg"],
  },
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
  verification: {
    google: "google-site-verification-code", // Ganti punya lo
  },
  alternates: {
    canonical: "https://koje24.com",
  },
};

// 🔥 LAZY LOADING UNTUK SEMUA KOMPONEN YANG DI BAWAH FOLD
const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-lg" />,
  ssr: true, // SSR tetap aktif buat SEO
});

const ProductGrid = dynamic(() => import("@/components/ProductGrid"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" />,
});

const AboutSection = dynamic(() => import("@/components/AboutSection"), {
  loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg" />,
});

const PackagesSection = dynamic(() => import("@/components/PackagesSection"), {
  loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-lg" />,
});

const SubscriptionSection = dynamic(() => import("@/components/SubscriptionSection"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />,
});

const TestimonialsCarousel = dynamic(() => import("@/components/TestimonialsCarousel"), {
  loading: () => <div className="h-48 bg-gray-50 animate-pulse rounded-lg" />,
  ssr: false, // Carousel gak perlu SSR
});

const FaqSection = dynamic(() => import("@/components/FaqSection"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" />,
});

// 🔥 POPUP TETAP DI-LOAD TAPI DI RENDER BERSYARAT
const CartPopup = dynamic(() => import("@/components/CartPopup"), { ssr: false });
const PackagePopup = dynamic(() => import("@/components/PackagePopup"), { ssr: false });
const RatingPopup = dynamic(() => import("@/components/RatingPopup"), { ssr: false });

// 🔥 COMPONENT UNTUK SKIP LINK (ACCESSIBILITY)
const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50"
  >
    Langsung ke konten utama
  </a>
);

// 🔥 BREADCRUMB UNTUK INTERNAL LINKING
const Breadcrumb = () => (
  <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm">
    <ol className="flex items-center space-x-2 text-gray-600">
      <li>
        <a href="/" className="hover:text-green-600">Beranda</a>
      </li>
      <li className="flex items-center">
        <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-gray-400">Produk</span>
      </li>
    </ol>
  </nav>
);

export default function HomePage() {
  return (
    <>
      {/* 🔥 SCHEMA MARKUP UNTUK LOCAL BUSINESS */}
      <Script
        id="schema-localbusiness"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "FoodEstablishment"],
            "name": "KOJE24",
            "description": "Natural Cold-Pressed Juice",
            "url": "https://koje24.com",
            "telephone": "+62812-3456-7890", // Ganti no telepon asli
            "priceRange": "Rp 25.000 - Rp 150.000",
            "image": "https://koje24.com/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Jakarta",
              "addressRegion": "DKI Jakarta",
              "addressCountry": "ID"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-6.2088", // Ganti sesuai lokasi
              "longitude": "106.8456"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "08:00",
                "closes": "21:00"
              }
            ],
            "sameAs": [
              "https://instagram.com/koje24", // Ganti socmed asli
              "https://facebook.com/koje24"
            ]
          })
        }}
      />

      {/* 🔥 SCHEMA MARKUP UNTUK WEBSITE */}
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "KOJE24",
            "url": "https://koje24.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://koje24.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* 🔥 SCHEMA MARKUP UNTUK BREADCRUMB */}
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Beranda",
                "item": "https://koje24.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Produk",
                "item": "https://koje24.com#produk"
              }
            ]
          })
        }}
      />

      {/* SKIP TO CONTENT LINK */}
      <SkipToContent />

      {/* HEADER SECTION - TANPA ANIMASI */}
      <PromoBanner />
      <Header />

      {/* BREADCRUMB */}
      <Breadcrumb />

      {/* MAIN CONTENT */}
      <main 
        id="main-content" 
        role="main" 
        aria-label="KOJE24 - Natural Cold-Pressed Juice"
        className="min-h-screen"
      >
        {/* HERO - PRIORITAS, TANPA ANIMASI */}
        <Hero />

        {/* FEATURED PRODUCTS - ANIMASI HALUS */}
        <AnimateOnScroll threshold={0.1} once={true}>
          <FeaturedProducts />
        </AnimateOnScroll>

        {/* PRODUCT GRID - KONTEN UTAMA */}
        <section 
          id="produk" 
          className="scroll-mt-24"
          aria-label="Daftar Produk Kami"
        >
          <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg mx-4" />}>
            <ProductGrid />
          </Suspense>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="scroll-mt-24">
          <AnimateOnScroll threshold={0.2} once={true}>
            <AboutSection />
          </AnimateOnScroll>
        </section>

        {/* PAKET SECTION */}
        <section id="paket" className="scroll-mt-24">
          <AnimateOnScroll threshold={0.2} once={true}>
            <PackagesSection />
          </AnimateOnScroll>
        </section>

        {/* LANGGANAN SECTION */}
        <section id="langganan" className="scroll-mt-24">
          <AnimateOnScroll threshold={0.2} once={true}>
            <SubscriptionSection />
          </AnimateOnScroll>
        </section>

        {/* TESTIMONI - TRUST BOOSTER */}
        <section 
          id="testimoni" 
          className="scroll-mt-24"
          aria-label="Testimoni Pelanggan"
        >
          <Suspense fallback={<div className="h-48 bg-gray-50 animate-pulse rounded-lg" />}>
            <TestimonialsCarousel />
          </Suspense>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="scroll-mt-24">
          <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
            <FaqSection />
          </Suspense>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* POPUPS - DI RENDER DI LUAR MAIN */}
      <Suspense fallback={null}>
        <CartPopup />
        <PackagePopup />
        <RatingPopup />
      </Suspense>
    </>
  );
}
