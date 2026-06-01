"use client"

import Image from "next/image"
import Script from "next/script"
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa"

// Constants from env
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '6282213139580'
const EMAIL = process.env.NEXT_PUBLIC_EMAIL || 'info@koje24.com'
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || 'koje24'
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK || '@koje24'

export default function Footer() {
  const handleOpenChat = () => {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent("open-koje24"))
      } catch (error) {
        console.warn('Failed to open chat:', error)
      }
    }
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Fungsi navigasi yang konsisten dengan header
  const handleNavClick = (href: string) => {
    if (typeof window === 'undefined') return;
    
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        window.location.href = `/${href}`;
        return;
      }
      
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = 80;
        const y = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <>
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "KOJE24",
            "legalName": "PT KOJE NATURAL INDONESIA",
            "url": "https://koje24.com",
            "logo": "https://koje24.com/image/logo-koje24-putih-removebg-preview.png",
            "sameAs": [
              `https://instagram.com/${INSTAGRAM}`,
              `https://tiktok.com/${TIKTOK}`,
              `https://wa.me/${WHATSAPP_NUMBER}`
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": `+${WHATSAPP_NUMBER}`,
              "contactType": "customer service",
              "email": EMAIL
            }
          })
        }}
      />

      <footer className="relative bg-[#0B4B50] text-white pt-16 md:pt-20 pb-8 md:pb-10 px-5 md:px-10 lg:px-20 overflow-hidden">
        {/* Premium Top Divider */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8]" />

        {/* Soft Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

        {/* MAIN WRAPPER */}
        <div className="max-w-7xl mx-auto relative z-10">
          {/* HEADER */}
          <div className="text-center mb-12 md:mb-14">
            <h3 className="font-playfair text-3xl md:text-4xl font-semibold tracking-tight">
              Stay Healthy With <span className="text-[#E8C46B]">KOJE24</span>
            </h3>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto mt-3 leading-relaxed">
              Minuman cold-pressed alami setiap hari untuk energi, imunitas, dan keseimbangan hidup 🌿
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-gray-300">
            {/* 1. BRAND */}
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/image/logo-koje24-putih-removebg-preview.png"
                  alt="KOJE24 - Natural Cold-Pressed Juice"
                  width={120}
                  height={120}
                  className="object-contain"
                  loading="lazy"
                />
              </div>
              <p className="text-sm leading-relaxed mb-3">
                Jus cold-pressed alami tanpa gula tambahan dan tanpa pengawet.
                Hidup sehat setiap hari dengan rasa premium.
              </p>
              <p className="text-sm italic text-[#E8C46B]">
                “Explore the Taste, Explore the World.”
              </p>
            </div>

            {/* 2. MENU */}
            <div>
              <h5 className="font-semibold text-white mb-4 text-base md:text-lg">
                <span className="border-b-2 border-[#0FA3A8] pb-1 inline-block">Menu</span>
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => handleNavClick("#produk")} 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → Produk
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick("#about")} 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → Tentang KOJE24
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick("#langganan")} 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → Langganan Paket
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick("#testimoni")} 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → Testimoni
                  </button>
                </li>
                <li>
                  <a 
                    href="/pusat-bantuan" 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → Pusat Bantuan
                  </a>
                </li>
              </ul>
            </div>

            {/* 3. BANTUAN */}
            <div>
              <h5 className="font-semibold text-white mb-4 text-base md:text-lg">
                <span className="border-b-2 border-[#0FA3A8] pb-1 inline-block">Bantuan</span>
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={handleOpenChat}
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → KOJE24 Assistant
                  </button>
                </li>
                <li>
                  <a 
                    href="/pusat-bantuan" 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → FAQ & Informasi
                  </a>
                </li>
                <li>
                  <a 
                    href={`mailto:${EMAIL}`} 
                    className="hover:text-[#E8C46B] hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    → Email Support
                  </a>
                </li>
              </ul>
            </div>

            {/* 4. KONTAK */}
            <div>
              <h5 className="font-semibold text-white mb-4 text-base md:text-lg">
                <span className="border-b-2 border-[#0FA3A8] pb-1 inline-block">Hubungi Kami</span>
              </h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#E8C46B] transition-all duration-300 group"
                  >
                    <span className="bg-white/10 p-1.5 rounded-full group-hover:bg-[#25D366]/20 transition-all">
                      <FaWhatsapp className="text-sm" />
                    </span>
                    WhatsApp Order
                  </a>
                </li>
                <li>
                  <a
                    href={`https://instagram.com/${INSTAGRAM}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#E8C46B] transition-all duration-300 group"
                  >
                    <span className="bg-white/10 p-1.5 rounded-full group-hover:bg-[#E4405F]/20 transition-all">
                      <FaInstagram className="text-sm" />
                    </span>
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={`https://tiktok.com/${TIKTOK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#E8C46B] transition-all duration-300 group"
                  >
                    <span className="bg-white/10 p-1.5 rounded-full group-hover:bg-[#000000]/20 transition-all">
                      <FaTiktok className="text-sm" />
                    </span>
                    TikTok
                  </a>
                </li>
                <li className="pt-2">
                  <span className="block text-xs text-gray-400 mb-1">Email:</span>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-sm hover:text-[#E8C46B] transition-colors break-all"
                  >
                    {EMAIL}
                  </a>
                </li>
                <li className="pt-2 mt-1 border-t border-white/10">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    🕐 Operasional: Senin - Sabtu | 08:00 - 20:00
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="flex flex-wrap justify-center gap-2 mt-12 mb-6">
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs">💳 Visa</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs">💳 Mastercard</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs">📱 QRIS</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs">🏧 Bank Transfer</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs">📦 COD (Jakarta)</span>
          </div>

          {/* HALAL CERTIFICATION */}
          <div className="flex flex-col items-center justify-center gap-2 mt-6 mb-6 text-gray-300 text-[11px] md:text-xs">
            <Image
              src="/image/halal.png"
              alt="Sertifikasi Halal Indonesia - Produk KOJE24 telah tersertifikasi halal"
              width={160}
              height={56}
              className="h-[40px] md:h-[52px] w-auto opacity-85"
              loading="lazy"
              quality={90}
            />
            <span className="text-center leading-relaxed">
              Diproduksi sesuai standar <b>Sertifikasi Halal Indonesia</b>
            </span>
            <span className="text-center text-[10px] md:text-[11px] text-gray-400 tracking-wide">
              Diproduksi oleh <b className="text-gray-300">PT KOJE NATURAL INDONESIA</b>
            </span>
          </div>

          {/* FOOTER LINE */}
          <div className="border-t border-white/10 pt-6 text-center text-gray-400 text-xs md:text-sm">
            © 2025 <span className="text-[#E8C46B] font-semibold">KOJE24</span> • All Rights Reserved  
            <br className="md:hidden" />
            <span className="text-[#0FA3A8] ml-1">Natural Cold-Pressed Juice Indonesia</span>
          </div>
        </div>

        {/* Glow Accent */}
        <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-[#0FA3A8]/10 blur-[110px]" />
      </footer>

      {/* Scroll to Top Button - Fixed Position */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-[#0FA3A8] hover:bg-[#0B4B50] text-white w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
        aria-label="Scroll to top"
      >
        <span className="transform group-hover:-translate-y-0.5 transition-transform duration-300">↑</span>
      </button>
    </>
  )
}
