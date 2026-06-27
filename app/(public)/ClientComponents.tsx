// app/(public)/ClientComponents.tsx
'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// ✅ SEMUA KOMPONEN DENGAN ssr: false PINDAH KE SINI
const SubscriptionSection = dynamic(
  () => import('@/components/SubscriptionSection'),
  { 
    loading: () => <div className="h-16" />,
    ssr: false
  }
)

const TestimonialsCarousel = dynamic(
  () => import('@/components/TestimonialsCarousel'),
  { 
    loading: () => <div className="h-32 flex items-center justify-center">Memuat testimoni...</div>,
    ssr: false
  }
)

const FaqSection = dynamic(
  () => import('@/components/FaqSection'),
  { 
    loading: () => <div className="h-16" />,
    ssr: false
  }
)

const CartPopup = dynamic(
  () => import('@/components/CartPopup'),
  { ssr: false }
)

const PackagePopup = dynamic(
  () => import('@/components/PackagePopup'),
  { ssr: false }
)

const RatingPopup = dynamic(
  () => import('@/components/RatingPopup'),
  { ssr: false }
)

export function ClientComponents() {
  return (
    <>
      <SubscriptionSection />
      <TestimonialsCarousel />
      <FaqSection />
      <Suspense fallback={null}>
        <CartPopup />
        <PackagePopup />
        <RatingPopup />
      </Suspense>
    </>
  )
}
