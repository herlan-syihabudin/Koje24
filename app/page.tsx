"use client"

import Header from "@/components/Header"
import Hero from "@/components/Hero"
import ProductGrid from "@/components/ProductGrid"
import PackagesSection from "@/components/PackagesSection"
import AboutSection from "@/components/AboutSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimoniCarousel from "@/components/TestimoniCarousel"
import FaqSection from "@/components/FaqSection"
import Footer from "@/components/Footer"
import StickyCartBar from "@/components/StickyCartBar"

// Popup
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <PackagesSection />
      <ProductGrid />
      <AboutSection />
      <SubscriptionSection />
      <TestimoniCarousel />
      <FaqSection />
      <Footer />

      {/* Komponen global (sekali render) */}
      <CartPopup />
      <PackagePopup />
      <StickyCartBar />
    </main>
  )
}
