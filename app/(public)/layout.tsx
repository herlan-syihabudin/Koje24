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
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "KOJE24 • Natural Cold-Pressed Juice",
    template: "%s | KOJE24",
  },
  description:
    "KOJE24 — minuman cold-pressed alami premium tanpa gula tambahan dan tanpa pengawet. Cocok untuk detoks harian dan menjaga imunitas.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    'google-site-verification': '_cTz7gO2HdLMjoMfCIAp2Fud_Wb6X2Yy1t7j6L9Et9k',
  }
};

export const viewport: Viewport = {
  themeColor: "#0FA3A8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: true,
  viewportFit: "cover",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "KOJE24",
  "url": "https://koje24.com",
  "logo": "https://koje24.com/icons/icon-512x512.png",
  "sameAs": [
    "https://instagram.com/koje24",
    "https://wa.me/6282213139580"
  ]
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "KOJE24",
  "url": "https://koje24.com",
  "logo": "https://koje24.com/icons/icon-512x512.png",
  "description": "Cold pressed juice delivery Bekasi & Jakarta. Jus detox tanpa gula, tanpa pengawet, fresh daily.",
  "areaServed": ["Jakarta", "Bekasi", "Depok", "Bogor"],
  "priceRange": "$$",
  "paymentAccepted": ["Cash", "Transfer Bank", "QRIS"],
  "telephone": "+6282213139580",
  "sameAs": [
    "https://instagram.com/koje24",
    "https://wa.me/6282213139580"
  ]
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
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main id="main-content" className="min-h-screen">{children}</main>
      <Footer />

      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
