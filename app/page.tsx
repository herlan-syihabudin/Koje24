// app/page.tsx (SERVER COMPONENT)

import { Metadata } from "next"
import PromoBanner from "@/components/PromoBanner"
import Hero from "@/components/Hero"
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

      <Hero />

      {/* TAMBAHKAN ID DI SINI */}
      <section id="produk">
        <AnimateOnScroll direction="up">
          <FeaturedProducts />
        </AnimateOnScroll>

        <ProductGrid />
      </section>

      {/* TAMBAHKAN ID DI SINI */}
      <section id="about">
        <AboutSection />
      </section>

      {/* TAMBAHKAN ID DI SINI */}
      <section id="langganan">
        <PackagesSection />
        <SubscriptionSection />
      </section>

      {/* TAMBAHKAN ID DI SINI */}
      <section id="testimoni">
        <TestimonialsCarousel />
      </section>

      <FaqSection />

      {/* REDIRECT UNTUK MENU BANTUAN */}
      <section id="bantuan" className="h-0 overflow-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hash === '#bantuan') {
                window.location.href = '/pusat-bantuan';
              }
            `
          }}
        />
      </section>

      <CartPopup />
      <PackagePopup />
      <RatingPopup />
    </>
  )
}
