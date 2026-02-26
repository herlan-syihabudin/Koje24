"use client"

import Link from "next/link"
import Script from "next/script"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

// ... data constants tetap sama ...
const BENEFITS = []
const FUNCTION_TAGS = []
const MANFAAT_TESTIMONI = []
const NUTRIENTS = []
const MOMENTS = []

// Lazy load components
const TestimoniSnippets = dynamic(() => import('@/components/TestimoniSnippets'), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
})

const NutrientPanel = dynamic(() => import('@/components/NutrientPanel'), {
  loading: () => <div className="h-64 bg-[#0B4B50]/50 animate-pulse rounded-3xl" />
})

export default function ManfaatPage() {
  const [activeTab, setActiveTab] = useState(0)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.9])
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.98])

  return (
    <>
      {/* Schema Markup - Article */}
      <Script id="manfaat-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Manfaat Minum KOJE24 Setiap Hari",
          "description": "Temukan berbagai manfaat kesehatan dari konsumsi rutin cold-pressed juice KOJE24.",
          "author": { "@type": "Organization", "name": "KOJE24" }
        })}
      </Script>

      {/* ✅ NEW: FAQ Schema untuk SEO */}
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": BENEFITS.map(b => ({
            "@type": "Question",
            "name": b.title,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": b.desc
            }
          }))
        })}
      </Script>

      <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-[#f2f9f9] to-[#e0f0f0] text-[#0B4B50] relative">
        {/* Sticky Navigation - with ARIA labels */}
        <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-50">
          {["manfaat", "nutrisi", "waktu", "testimoni"].map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' })}
              aria-label={`Scroll ke bagian ${s}`} // ✅ ARIA LABEL
              className="group flex items-center gap-2 mb-3"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-[#0FA3A8] transition-all" />
              <span className="text-xs text-gray-400 group-hover:text-[#0FA3A8] opacity-0 group-hover:opacity-100 transition-opacity">
                {s}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Aura Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-10 w-72 h-72 bg-[#0FA3A8]/12 blur-3xl rounded-full" />
          <div className="absolute -bottom-40 right-[-60px] w-80 h-80 bg-[#E8C46B]/16 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20 space-y-16 md:space-y-20">
          {/* HERO SECTION - unchanged */}
          <motion.section
            style={{ opacity: headerOpacity, scale: headerScale }}
            className="mb-4"
          >
            {/* ... hero content same ... */}
          </motion.section>

          {/* FUNCTION TABS - with ARIA */}
          <section id="manfaat">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {FUNCTION_TAGS.map((tag, idx) => (
                <button
                  key={tag}
                  onClick={() => setActiveTab(idx)}
                  aria-label={`Filter manfaat: ${tag}`} // ✅ ARIA LABEL
                  aria-pressed={activeTab === idx} // ✅ ARIA STATE
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                    activeTab === idx
                      ? "bg-[#0FA3A8] text-white shadow-lg"
                      : "bg-white border border-[#d7ecec] text-[#0B4B50] hover:bg-[#f4faf9]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* BENEFIT GRID - filtered */}
            <div className="grid gap-6 md:gap-7 md:grid-cols-2">
              {BENEFITS.filter((_, idx) => activeTab === 0 || idx === activeTab - 1)
                .map((b, idx) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="relative overflow-hidden rounded-3xl bg-white/90 border border-[#e0f1f1] shadow-[0_8px_28px_rgba(11,75,80,0.07)] p-5 md:p-6"
                  >
                    <div className="absolute -top-6 -right-10 w-24 h-24 bg-[#0FA3A8]/7 blur-2xl rounded-full" />
                    <div className="relative">
                      <p className="inline-flex items-center px-3 py-1 rounded-full bg-[#f4faf9] text-[11px] font-semibold text-[#0FA3A8] mb-3 border border-[#d7ecec]">
                        {b.tag}
                      </p>
                      <h3 className="font-playfair text-lg md:text-xl font-semibold mb-2">
                        {b.title}
                      </h3>
                      <p className="text-sm md:text-[15px] text-gray-600 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </section>

          {/* TESTIMONI SNIPPETS - LAZY LOADED */}
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-2xl" />}>
            <TestimoniSnippets testimonials={MANFAAT_TESTIMONI} />
          </Suspense>

          {/* NUTRIENT PANEL - with CLAMPED progress bar */}
          <Suspense fallback={<div className="h-64 bg-[#0B4B50]/50 animate-pulse rounded-3xl" />}>
            <section id="nutrisi" className="rounded-3xl bg-[#0B4B50] text-white px-5 py-5 md:px-7 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-teal-100/80 mb-1">
                    Nutrient snapshot
                  </p>
                  <h3 className="font-playfair text-xl md:text-2xl font-semibold">
                    Kandungan per 1 botol KOJE24
                  </h3>
                </div>
              </div>

              <div className="grid gap-4">
                {NUTRIENTS.map((n, i) => {
                  const clampedValue = Math.min(100, n.value) // ✅ CLAMP!
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{n.name}</span>
                        <span className="font-semibold">{clampedValue}{n.unit}</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${clampedValue}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-[#E8C46B] rounded-full"
                          role="progressbar" // ✅ ARIA
                          aria-valuenow={clampedValue} // ✅ ARIA
                          aria-valuemin={0} // ✅ ARIA
                          aria-valuemax={100} // ✅ ARIA
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-teal-100/60 mt-4">
                *Berdasarkan rata-rata kandungan dari seluruh varian KOJE24
              </p>
            </section>
          </Suspense>

          {/* TIMING SECTION - unchanged */}
          <section id="waktu">
            {/* ... existing timing content ... */}
          </section>

          {/* CTA FINAL - with share button & ARIA */}
          <section className="mt-4 md:mt-6 relative">
            <button
              onClick={() => navigator.share?.({
                title: 'Manfaat Minum KOJE24',
                text: 'Temukan manfaat minum KOJE24 setiap hari untuk kesehatan!',
                url: window.location.href,
              })}
              aria-label="Bagikan halaman ini" // ✅ ARIA LABEL
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md z-10"
            >
              <svg className="w-5 h-5 text-[#0B4B50]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.04 9.81C6.5 9.31 5.79 9 5 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>

            {/* ... existing CTA content ... */}
          </section>
        </div>
      </main>
    </>
  )
}
