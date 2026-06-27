// app/(public)/layout.tsx

import { Suspense } from "react";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCartBar from "@/components/StickyCartBar";
import PromoPopup from "@/components/PromoPopup";
import TestimonialSchemaSEO from "@/components/TestimonialSchemaSEO";
import InstallPWAButton from "@/components/InstallPWAButton";
import ChatWidget from "@/components/ChatWidget";
import { SpeedInsights } from "@vercel/speed-insights/next";

// ✅ TAMBAHKAN METADATA GLOBAL (UNTUK SEO)
export const metadata = {
  metadataBase: new URL('https://koje24.com'),
  title: {
    default: "KOJE24 - Cold Pressed Juice Bekasi & Jakarta",
    template: "%s | KOJE24",
  },
  description: "Cold-pressed juice segar 100% alami tanpa gula tambahan. Detox harian, booster imun, dan energi alami. Delivery Bekasi & Jakarta.",
  keywords: "cold pressed juice Bekasi, jus detox Bekasi, jus sehat tanpa gula, KOJE24, minuman detox alami, cold pressed juice Jakarta",
  authors: [{ name: "KOJE24", url: "https://koje24.com" }],
  creator: "KOJE24",
  publisher: "KOJE24",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxVideoPreview: -1,
      maxImagePreview: "large",
      maxSnippet: -1,
    },
  },
  alternates: {
    canonical: "https://koje24.com",
  },
  openGraph: {
    type: "website",
    url: "https://koje24.com",
    title: "KOJE24 - Cold Pressed Juice Bekasi & Jakarta",
    description: "Cold-pressed juice segar 100% alami tanpa gula tambahan. Delivery Bekasi & Jakarta.",
    siteName: "KOJE24",
    images: [{
      url: "https://koje24.com/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "KOJE24 Cold Pressed Juice - Minuman Detox Alami",
    }],
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOJE24 - Cold Pressed Juice Bekasi & Jakarta",
    description: "Cold-pressed juice segar 100% alami tanpa gula tambahan.",
    images: ["https://koje24.com/og-image.jpg"],
  },
  verification: {
    google: "_cTz7gO2HdLMjoMfCIAp2Fud_Wb6X2Yy1t7j6L9Et9k",
  },
  category: "food",
};

// ✅ OPTIMASI SCHEMA ORGANIZATION
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KOJE24",
  legalName: "PT KOJE NATURAL INDONESIA",
  url: "https://koje24.com",
  logo: "https://koje24.com/icons/icon-512x512.png",
  description: "Cold-pressed juice premium alami tanpa gula tambahan. Detox harian, booster imun, dan energi alami.",
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+6282213139580",
    contactType: "customer service",
    email: "info@koje24.com",
    availableLanguage: ["Indonesian"],
  },
  sameAs: [
    "https://instagram.com/koje24",
    "https://tiktok.com/@koje24",
    "https://wa.me/6282213139580",
  ],
};

// ✅ OPTIMASI SCHEMA LOCAL BUSINESS
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "KOJE24",
  url: "https://koje24.com",
  logo: "https://koje24.com/icons/icon-512x512.png",
  description: "Cold pressed juice delivery Bekasi & Jakarta. Jus detox tanpa gula, tanpa pengawet, fresh daily.",
  areaServed: ["Bekasi", "Jakarta", "Depok", "Bogor", "Tangerang", "Bandung"],
  priceRange: "Rp15.000 - Rp450.000",
  paymentAccepted: ["Cash", "Transfer Bank", "QRIS", "E-Wallet"],
  telephone: "+6282213139580",
  email: "info@koje24.com",
  openingHours: ["Mo-Sa 08:00-20:00"],
  sameAs: [
    "https://instagram.com/koje24",
    "https://tiktok.com/@koje24",
    "https://wa.me/6282213139580",
  ],
};

// ✅ TAMBAHKAN BREADCRUMB SCHEMA
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Beranda",
      "item": "https://koje24.com/",
    },
  ],
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#0FA3A8] focus:text-white focus:p-4 focus:rounded-lg"
      >
        Langsung ke konten utama
      </a>

      <Header />
      <TestimonialSchemaSEO />

      {/* ✅ SCHEMA ORGANIZATION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      {/* ✅ SCHEMA LOCAL BUSINESS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      {/* ✅ SCHEMA BREADCRUMB */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />

      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          duration: 3000,
        }}
      />

      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
      <Suspense fallback={null}>
        <InstallPWAButton />
      </Suspense>
      <Suspense fallback={null}>
        <StickyCartBar />
      </Suspense>
      <Suspense fallback={null}>
        <PromoPopup />
      </Suspense>

      <SpeedInsights />
    </>
  );
}
