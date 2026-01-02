"use client"

import Image from "next/image"
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="relative bg-[#0B4B50] text-white pt-20 pb-10 px-6 md:px-14 lg:px-24 overflow-hidden">

      {/* 💠 Premium Top Divider */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8]" />

      {/* 🌫️ Soft Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      {/* MAIN WRAPPER */}
      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h3 className="font-playfair text-3xl md:text-4xl font-semibold tracking-tight">
            Stay Healthy With <span className="text-[#E8C46B]">KOJE24</span>
          </h3>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto mt-3 leading-relaxed">
            Minuman cold-pressed alami setiap hari untuk energi, imunitas, dan keseimbangan hidup 🌿
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-gray-300">

          {/* 1. BRAND */}
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/image/logo-koje24-putih-removebg-preview.png"
                alt="KOJE24"
                width={82}
                height={82}
                className="object-contain"
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
            <h5 className="font-semibold text-white mb-4 text-lg">Menu</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#produk" className="hover:text-[#E8C46B]">Produk</a></li>
              <li><a href="#about" className="hover:text-[#E8C46B]">Tentang KOJE24</a></li>
              <li><a href="#langganan" className="hover:text-[#E8C46B]">Langganan Paket</a></li>
              <li><a href="#testimoni" className="hover:text-[#E8C46B]">Testimoni</a></li>
              <li><a href="/bantuan" className="hover:text-[#E8C46B]">Pusat Bantuan</a></li>
            </ul>
          </div>

          {/* 3. BANTUAN */}
          <div>
            <h5 className="font-semibold text-white mb-4 text-lg">Bantuan</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("open-koje24"))
                  }
                  className="hover:text-[#E8C46B] transition-all"
                >
                  KOJE24 Assistant (Chat Cepat)
                </button>
              </li>
              <li><a href="/bantuan" className="hover:text-[#E8C46B]">FAQ & Informasi Bantuan</a></li>
              <li><a href="mailto:info@koje24.id" className="hover:text-[#E8C46B]">Email Support</a></li>
            </ul>
          </div>

          {/* 4. KONTAK */}
          <div>
            <h5 className="font-semibold text-white mb-4 text-lg">Hubungi Kami</h5>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://wa.me/6282213139580"
                  target="_blank"
                  className="flex items-center gap-2 hover:text-[#E8C46B]"
                >
                  <FaWhatsapp className="text-lg" /> WhatsApp Order
                </a>
              </li>

              <li>
                <a
                  href="https://instagram.com/koje24"
                  target="_blank"
                  className="flex items-center gap-2 hover:text-[#E8C46B]"
                >
                  <FaInstagram className="text-lg" /> Instagram
                </a>
              </li>

              <li>
                <a
                  href="https://tiktok.com/@koje24"
                  target="_blank"
                  className="flex items-center gap-2 hover:text-[#E8C46B]"
                >
                  <FaTiktok className="text-lg" /> TikTok
                </a>
              </li>

              <li className="pt-1">
                <span className="block">Email:</span>
                <a
                  href="mailto:info@koje24.id"
                  className="hover:text-[#E8C46B]"
                >
                  info@koje24.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ✅ HALAL CERTIFICATION (TRUST ZONE) */}
<div className="flex flex-col items-center justify-center gap-2 mt-14 mb-6 text-gray-300 text-[11px] md:text-xs">
  <Image
    src="/image/halal.png"
    alt="Sertifikasi Halal Indonesia"
    width={160}   // retina sharp
    height={56}
    className="h-[40px] md:h-[52px] w-auto opacity-85"
  />

  <span className="text-center leading-relaxed">
    Diproduksi sesuai standar <b>Sertifikasi Halal Indonesia</b>
  </span>

  {/* ✅ LEGAL ENTITY */}
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
  )
}
