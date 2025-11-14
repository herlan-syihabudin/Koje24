"use client"

import Header from "@/components/Header"
import Hero from "@/components/Hero"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimoniCarousel from "@/components/TestimoniCarousel"
import FaqSection from "@/components/FaqSection"
import Footer from "@/components/Footer"
import StickyCartBar from "@/components/StickyCartBar"
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"
import PackagesSection from "@/components/PackagesSection"

export default function HomePage() {
  return (
    <main>

      <Header />
      <Hero />

      {/* ========= PRODUK ========= */}
      <section id="produk" className="scroll-mt-24">
        <ProductGrid />
      </section>

      {/* ========= TENTANG ========= */}
      <section id="about" className="scroll-mt-24">
        <AboutSection />
      </section>

      {/* ========= PAKET (NO NAV HEADER) ========= */}
      <PackagesSection />

      {/* ========= LANGGANAN ========= */}
      <section id="langganan" className="scroll-mt-24">
        <SubscriptionSection />
      </section>

      {/* ========= TESTIMONI ========= */}
      <TestimoniCarousel />  {/* sudah ada id="testimoni" di dalamnya */}

      {/* ========= FAQ ========= */}
      <section id="faq" className="scroll-mt-24">
        <FaqSection />
      </section>

      <Footer />

      {/* ========== POPUPS ========== */}
      <CartPopup />
      <PackagePopup />

      <StickyCartBar />

    </main>
  )
}
