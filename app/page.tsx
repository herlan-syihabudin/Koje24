"use client";

import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import ProductGrid from "@/components/ProductGrid";
import AboutSection from "@/components/AboutSection";
import PackagesSection from "@/components/PackagesSection";
import SubscriptionSection from "@/components/SubscriptionSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import CartPopup from "@/components/CartPopup";
import PackagePopup from "@/components/PackagePopup";
import RatingPopup from "@/components/RatingPopup";

// 🔥 ANIMATION WRAPPER
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function HomePage() {
  return (
    <main role="main" aria-label="KOJE24 - Natural Cold-Pressed Juice">
      {/* 🔥 PROMO BANNER PALING ATAS (JANGAN DIANIMASI) */}
      <PromoBanner />

      {/* HEADER (JANGAN DIANIMASI) */}
      <Header />

      {/* HERO (PRIORITAS #1) */}
      <AnimateOnScroll>
        <Hero />
      </AnimateOnScroll>

      {/* FEATURED PRODUCTS / UX GUIDE */}
      <AnimateOnScroll delay={0.1}>
        <FeaturedProducts />
      </AnimateOnScroll>

      {/* PRODUK GRID (JANGAN DULU, ISINYA BANYAK) */}
      <section id="produk" className="scroll-mt-24">
        <ProductGrid />
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24">
        <AnimateOnScroll>
          <AboutSection />
        </AnimateOnScroll>
      </section>

      {/* PAKET */}
      <section id="paket" className="scroll-mt-24">
        <AnimateOnScroll>
          <PackagesSection />
        </AnimateOnScroll>
      </section>

      {/* LANGGANAN */}
      <section id="langganan" className="scroll-mt-24">
        <AnimateOnScroll>
          <SubscriptionSection />
        </AnimateOnScroll>
      </section>

      {/* TESTIMONI (TRUST BOOSTER) */}
      <section id="testimoni" className="scroll-mt-24">
        <AnimateOnScroll>
          <TestimonialsCarousel />
        </AnimateOnScroll>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24">
        <AnimateOnScroll>
          <FaqSection />
        </AnimateOnScroll>
      </section>

      {/* FOOTER (NO ANIMATION) */}
      <Footer />

      {/* POPUPS GLOBAL (NO ANIMATION) */}
      <CartPopup />
      <PackagePopup />
      <RatingPopup />
    </main>
  );
}
