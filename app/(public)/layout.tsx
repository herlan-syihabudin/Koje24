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

// ✅ METADATA GLOBAL
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

// ✅ SCHEMA ORGANIZATION
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

// ✅ SCHEMA LOCAL BUSINESS
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

// ✅ SCHEMA BREADCRUMB
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

// ✅ SCHEMA FAQ (TAMBAHAN)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apa itu cold pressed juice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cold pressed juice adalah jus yang dibuat dengan teknologi cold-press (tekanan dingin) tanpa panas, sehingga nutrisi dan enzim alami tetap terjaga maksimal. KOJE24 menggunakan metode ini untuk menghasilkan jus yang lebih sehat dan segar."
      }
    },
    {
      "@type": "Question",
      "name": "Apa manfaat minum jus detox setiap hari?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Minum jus detox setiap hari membantu membersihkan racun dalam tubuh, meningkatkan energi, memperbaiki pencernaan, mencerahkan kulit, dan memperkuat sistem imun. KOJE24 dibuat tanpa gula tambahan sehingga aman untuk konsumsi harian."
      }
    },
    {
      "@type": "Question",
      "name": "Berapa harga cold pressed juice di Bekasi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harga cold pressed juice di Bekasi mulai dari Rp18.000 per botol untuk produk reguler, dan paket hemat mulai dari Rp120.000 untuk 7 hari. KOJE24 menawarkan harga terjangkau dengan kualitas premium."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah KOJE24 aman untuk diet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, KOJE24 sangat aman untuk diet karena tanpa gula tambahan, rendah kalori, dan kaya serat. Sangat cocok untuk program detoks dan menjaga berat badan ideal."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah KOJE24 bisa dikirim ke luar kota?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Saat ini pengiriman rutin tersedia untuk area Jabodetabek. Untuk area di luar kota, silakan hubungi kami via WhatsApp agar tim kami bisa bantu atur pengiriman khusus dengan pendingin."
      }
    },
    {
      "@type": "Question",
      "name": "Berapa lama masa simpan jus KOJE24?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Disarankan dikonsumsi maksimal 2–3 hari setelah produksi dan disimpan di dalam kulkas pada suhu ≤4°C. Kocok perlahan sebelum diminum untuk menjaga rasa dan kualitas alami."
      }
    }
  ]
};

// ✅ SCHEMA WEBSITE + SEARCH (TAMBAHAN)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://koje24.com",
  "name": "KOJE24 - Cold Pressed Juice Bekasi & Jakarta",
  "description": "Cold-pressed juice segar 100% alami tanpa gula tambahan. Delivery Bekasi & Jakarta.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://koje24.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// ✅ SCHEMA GEOLOCATION (TAMBAHAN)
const geoLocationSchema = {
  "@context": "https://schema.org",
  "@type": "Place",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-6.350",
    "longitude": "107.050"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bekasi",
    "addressRegion": "Jawa Barat",
    "addressCountry": "ID"
  }
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ✅ PRECONNECT UNTUK FONT */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* ✅ SKIP TO CONTENT (ACCESSIBILITY) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#0FA3A8] focus:text-white focus:p-4 focus:rounded-lg"
      >
        Langsung ke konten utama
      </a>

      <Header />
      <TestimonialSchemaSEO />

      {/* ✅ ALL SCHEMA MARKUPS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(geoLocationSchema) }}
      />

      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />

      {/* ✅ TOASTER */}
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

      {/* ✅ SUSPENSE COMPONENTS */}
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
