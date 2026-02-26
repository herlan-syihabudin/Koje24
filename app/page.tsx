// app/page.tsx (SERVER COMPONENT)

import { Metadata } from "next"
import Header from "@/components/Header"
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
import Footer from "@/components/Footer"
import AnimateOnScroll from "@/components/AnimateOnScroll"

import FeaturedProducts from "@/components/FeaturedProducts"
import ProductGrid from "@/components/ProductGrid"
import AboutSection from "@/components/AboutSection"
import PackagesSection from "@/components/PackagesSection"
import SubscriptionSection from "@/components/SubscriptionSection"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import FaqSection from "@/components/FaqSection"
import CartPopup from "@/components/CartPopup"
import PackagePopup from "@/components/PackagePopup"
import RatingPopup from "@/components/RatingPopup"

export const metadata: Metadata = {
  title: "KOJE24 - Natural Cold-Pressed Juice Jakarta",
  description:
    "Cold-pressed juice segar tanpa gula tambahan. Delivery Jakarta & Tangerang.",
}

export default function HomePage() {
  return (
    <>
      <PromoBanner />
      <Header />

      <main className="min-h-screen">
        <Hero />

        <AnimateOnScroll direction="up">
          <FeaturedProducts />
        </AnimateOnScroll>

        <ProductGrid />
        <AboutSection />
        <PackagesSection />
        <SubscriptionSection />
        <TestimonialsCarousel />
        <FaqSection />
      </main>

      <Footer />

      <CartPopup />
      <PackagePopup />
      <RatingPopup />
    </>
  )
}