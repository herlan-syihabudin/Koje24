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
      <ProductGrid />
      <AboutSection />
      <PackagesSection />
      <SubscriptionSection />
      <TestimoniCarousel />
      <FaqSection />
      <Footer />
      <CartPopup />
      <PackagePopup />
      <StickyCartBar />
    </main>
  )
}
