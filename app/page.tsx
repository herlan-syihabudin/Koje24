"use client"

import Header from "@/components/Header"
import Hero from "@/components/Hero"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimoniCarousel from "@/components/TestimoniCarousel"
import FaqSection from "@/components/FaqSection"
import Footer from "@/components/Footer"
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"
import PackagesSection from "@/components/PackagesSection"
import RatingPopup from "@/components/RatingPopup"

export default function HomePage() {
  return (
    <main role="main" aria-label="KOJE24 - Natural Cold-Pressed Juice">

      <Header />
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
        <TestimoniCarousel />
      </section>

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
