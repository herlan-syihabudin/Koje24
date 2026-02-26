// app/page.tsx (SERVER COMPONENT - TANPA "use client"!)
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// LAZY LOADING UNTUK KOMPONEN BERAT
const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const ProductGrid = lazy(() => import("@/components/ProductGrid"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const PackagesSection = lazy(() => import("@/components/PackagesSection"));
const SubscriptionSection = lazy(() => import("@/components/SubscriptionSection"));
const TestimonialsCarousel = lazy(() => import("@/components/TestimonialsCarousel"));
const FaqSection = lazy(() => import("@/components/FaqSection"));
const CartPopup = lazy(() => import("@/components/CartPopup"));
const PackagePopup = lazy(() => import("@/components/PackagePopup"));
const RatingPopup = lazy(() => import("@/components/RatingPopup"));

// METADATA UNTUK SEO
export const metadata: Metadata = {
  title: "KOJE24 - Natural Cold-Pressed Juice Jakarta",
  description: "Cold-pressed juice segar tanpa gula tambahan. Delivery Jakarta & Tangerang. Cocok untuk detox dan menjaga imunitas.",
  openGraph: {
    title: "KOJE24 - Natural Cold-Pressed Juice",
    description: "Jus cold-pressed alami, dikirim segar setiap hari",
    images: ["/og-image.jpg"],
  },
};

export default function HomePage() {
  return (
    <>
      {/* HEADER SECTION - LANGSUNG TANPA ANIMASI */}
      <PromoBanner />
      <Header />

      {/* MAIN CONTENT */}
      <main 
        role="main" 
        aria-label="KOJE24 - Natural Cold-Pressed Juice"
        className="min-h-screen"
      >
        {/* HERO - PRIORITAS, TANPA ANIMASI! */}
        <Hero />

        {/* FEATURED PRODUCTS */}
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse" />}>
          <AnimateOnScroll direction="up" threshold={0.1}>
            <FeaturedProducts />
          </AnimateOnScroll>
        </Suspense>

        {/* PRODUK GRID - KONTEN UTAMA */}
        <section id="produk" className="scroll-mt-24">
          <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
            <AnimateOnScroll direction="fade" threshold={0.1}>
              <ProductGrid />
            </AnimateOnScroll>
          </Suspense>
        </section>

        {/* ABOUT */}
        <section id="about" className="scroll-mt-24">
          <Suspense fallback={<div className="h-60 bg-gray-50 animate-pulse" />}>
            <AnimateOnScroll direction="left">
              <AboutSection />
            </AnimateOnScroll>
          </Suspense>
        </section>

        {/* PAKET */}
        <section id="paket" className="scroll-mt-24">
          <Suspense fallback={<div className="h-80 bg-gray-50 animate-pulse" />}>
            <AnimateOnScroll direction="right">
              <PackagesSection />
            </AnimateOnScroll>
          </Suspense>
        </section>

        {/* LANGGANAN */}
        <section id="langganan" className="scroll-mt-24">
          <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
            <AnimateOnScroll direction="up">
              <SubscriptionSection />
            </AnimateOnScroll>
          </Suspense>
        </section>

        {/* TESTIMONI */}
        <section id="testimoni" className="scroll-mt-24">
          <Suspense fallback={<div className="h-48 bg-gray-50 animate-pulse" />}>
            <AnimateOnScroll direction="scale" delay={0.2}>
              <TestimonialsCarousel />
            </AnimateOnScroll>
          </Suspense>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24">
          <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
            <AnimateOnScroll direction="fade">
              <FaqSection />
            </AnimateOnScroll>
          </Suspense>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* POPUPS - LAZY LOADED */}
      <Suspense fallback={null}>
        <CartPopup />
        <PackagePopup />
        <RatingPopup />
      </Suspense>
    </>
  );
}
