"use client"

import Header from "@/components/Header"
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
import FeaturedProducts from "@/components/FeaturedProducts"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import PackagesSection from "@/components/PackagesSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import FaqSection from "@/components/FaqSection"
import Footer from "@/components/Footer"
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"
import RatingPopup from "@/components/RatingPopup"

export default function HomePage() {
  return (
    <main role="main" aria-label="KOJE24 - Natural Cold-Pressed Juice">
      {/* 🔥 PROMO BANNER PALING ATAS */}
      <PromoBanner />

      {/* HEADER */}
      <Header />

      {/* HERO */}
      <Hero />

      {/* 🔥 FEATURED PRODUCTS (UX GUIDE) */}
      <FeaturedProducts />

      {/* PRODUK (GRID FULL) */}
      <section id="produk" className="scroll-mt-24">
        <ProductGrid />
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24">
        <AboutSection />
      </section>

      {/* PAKET */}
      <section id="paket" className="scroll-mt-24">
        <PackagesSection />
      </section>

      {/* LANGGANAN */}
      <section id="langganan" className="scroll-mt-24">
        <SubscriptionSection />
      </section>

      {/* TESTIMONI */}
      <section id="testimoni" className="scroll-mt-24">
        <TestimonialsCarousel />
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24">
        <FaqSection />
      </section>

      {/* FOOTER */}
      <Footer />

      {/* POPUPS (GLOBAL) */}
      <CartPopup />
      <PackagePopup />
      <RatingPopup />
    </main>
  )
}
