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
import RatingPopup from "@/components/RatingPopup" // ⭐ NEW

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

      {/* ========= PAKET ========= */}
      <PackagesSection />

      {/* ========= LANGGANAN ========= */}
      <section id="langganan" className="scroll-mt-24">
        <SubscriptionSection />
      </section>

      {/* ========= TESTIMONI ========= */}
      <TestimoniCarousel />

      {/* ========= FAQ ========= */}
      <section id="faq" className="scroll-mt-24">
        <FaqSection />
      </section>

      <Footer />

      {/* ========== POPUPS ========== */}
      <CartPopup />
      <PackagePopup />
      <RatingPopup /> {/* ⭐ AUTO-BEST SELLER LOGIC */}

      <StickyCartBar />

    </main>
  )
}
