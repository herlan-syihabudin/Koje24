"use client"

import Header from "@/components/Header"
import Hero from "@/components/Hero"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import FaqSection from "@/components/FaqSection"
import Footer from "@/components/Footer"
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"
import PackagesSection from "@/components/PackagesSection"
import RatingPopup from "@/components/RatingPopup"
import TestimonialSchemaSEO from "@/components/TestimonialSchemaSEO"
import PromoBanner from "@/components/PromoBanner"

export default function HomePage() {
  return (
    <main role="main" aria-label="KOJE24 - Natural Cold-Pressed Juice">

      {/* HEADER */}
      <Header />

      {/* 🔥 PROMO BANNER DIPINDAH KE SINI — PALING AMAN */}
      <PromoBanner />

      <Hero />

      {/* PRODUK */}
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

      {/* SEO JSON-LD USER TESTIMONI*/}
      <TestimonialSchemaSEO />

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24">
        <FaqSection />
      </section>

      <Footer />

      {/* POPUPS */}
      <CartPopup />
      <PackagePopup />
      <RatingPopup />
    </main>
  )
}
