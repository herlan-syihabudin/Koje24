"use client"

// KOJE24 Global Layout v1.2 (Stable Premium)
// — Fix: Header bleed & hero overlap resolved.
// — Fix: ProductGrid heading isolated (showHeading={false})
// — Enhancement: smoother divider rhythm + adaptive spacing.

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
import AnimateOnScroll from "@/components/AnimateOnScroll"
import Link from "next/link"

// ────────────────────────────────────────────────
// Tiny UI Atoms
// ────────────────────────────────────────────────
function SectionWrap({
  id,
  children,
  bleedTop = false,
}: {
  id?: string
  children: React.ReactNode
  bleedTop?: boolean
}) {
  return (
    <section
      id={id}
      className={[
        "relative w-full overflow-hidden transition-all duration-500",
        bleedTop ? "pt-0 md:pt-0" : "py-12 md:py-16 lg:py-20",
      ].join(" ")}
    >
      {children}
    </section>
  )
}

function DividerGlow({ tight = false }: { tight?: boolean }) {
  return (
    <div className={`relative w-full ${tight ? "my-4 md:my-5" : "my-6 md:my-8"}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0FA3A8]/0 via-[#0FA3A8]/25 to-[#0B4B50]/0" />
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10 md:mb-12">
      <h2 className="font-playfair text-[28px] md:text-[34px] lg:text-[36px] font-semibold text-[#0B4B50] leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-inter text-sm md:text-base text-[#557577] max-w-2xl mx-auto mt-3 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function GlobalCTA() {
  return (
    <div className="relative rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(15,163,168,.18),transparent_70%)]" />
      <div className="relative z-[1] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 px-6 md:px-10 lg:px-14 py-10 md:py-12 bg-white/70 backdrop-blur-sm border border-[#e6eeee]/60 rounded-3xl shadow-[0_10px_40px_rgba(15,163,168,0.12)]">
        <div className="text-center md:text-left">
          <h3 className="font-playfair text-2xl md:text-3xl text-[#0B4B50] font-semibold">
            Mulai gaya hidup sehat hari ini
          </h3>
          <p className="font-inter text-[#557577] mt-2 md:mt-3">
            Pilih paket langganan atau coba varian favorit kamu dulu.
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="#langganan"
            className="rounded-full bg-[#0FA3A8] text-white font-semibold px-5 py-2.5 text-sm md:text-base shadow-md hover:bg-[#0B4B50] transition-all"
          >
            Lihat Paket
          </Link>
          <Link
            href="#produk"
            className="rounded-full px-5 py-2.5 text-sm md:text-base font-semibold border border-[#0FA3A8] text-[#0FA3A8] hover:bg-[#0FA3A8] hover:text-white transition-all"
          >
            Lihat Produk
          </Link>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// Main Page Layout
// ────────────────────────────────────────────────
export default function HomeGlobal() {
  return (
    <main className="overflow-x-hidden bg-[#f8fcfc] text-[#0B4B50] scroll-smooth">
      {/* Header fixed */}
      <Header />

      {/* Hero */}
      <div className="relative z-0">
        <Hero />
      </div>

      {/* Produk Section */}
      <DividerGlow />
      <AnimateOnScroll>
        <SectionWrap id="produk">
          <SectionHeader
            title="Pilihan Produk KOJE24"
            subtitle="Bahan alami segar — tanpa pengawet & tanpa gula tambahan."
          />
          {/* 🩵 Prevent double title */}
          <ProductGrid showHeading={false} />
        </SectionWrap>
      </AnimateOnScroll>

      {/* Tentang Kami */}
      <DividerGlow />
      <AnimateOnScroll>
        <SectionWrap id="tentang">
          <AboutSection />
        </SectionWrap>
      </AnimateOnScroll>

      {/* Langganan */}
      <DividerGlow />
      <AnimateOnScroll>
        <SectionWrap id="langganan">
          <SubscriptionSection />
        </SectionWrap>
      </AnimateOnScroll>

      {/* Testimoni */}
      <DividerGlow tight />
      <AnimateOnScroll>
        <SectionWrap id="testimoni">
          <TestimoniCarousel />
        </SectionWrap>
      </AnimateOnScroll>

      {/* FAQ */}
      <DividerGlow tight />
      <AnimateOnScroll>
        <SectionWrap id="faq">
          <FaqSection />
        </SectionWrap>
      </AnimateOnScroll>

      {/* CTA Global */}
      <DividerGlow />
      <SectionWrap>
        <GlobalCTA />
      </SectionWrap>

      {/* Footer & Cart */}
      <Footer />
      <CartPopup />
      <StickyCartBar />
    </main>
  )
}
