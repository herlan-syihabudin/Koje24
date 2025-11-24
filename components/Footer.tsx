"use client"

import Image from "next/image"
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="relative bg-[#0B4B50] text-white pt-20 pb-10 px-6 md:px-14 lg:px-24 overflow-hidden">

      {/* ✨ Gold Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8]" />

      {/* 💎 Soft Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_70%)]" />

      {/* 🌟 Header CTA */}
      <div className="text-center mb-14 relative z-10">
        <h3 className="font-playfair text-3xl md:text-4xl font-semibold mb-4 tracking-tight leading-snug">
          Stay Healthy With <span className="text-[#E8C46B]">KOJE24</span>
        </h3>
        <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Minuman cold-pressed natural setiap hari untuk energi, imunitas,
          dan keseimbangan hidup 🌿
        </p>
      </div>

      {/* 🔥 Main Content Grid */}
      <div className="
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 
        gap-12 md:gap-10 mb-12 text-gray-300 relative z-10
      ">
        
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Image
              src="/favicon.ico"
              alt="KOJE24"
              width={48}
              height={48}
              className="rounded-full ring-2 ring-[#E8C46B]/40 shadow-lg"
            />
            <h4 className="font-playfair text-xl font-bold text-white">
              KOJE24
            </h4>
          </div>

          <p className="text-sm leading-relaxed mb-3">
            Jus cold-pressed alami tanpa gula tambahan dan tanpa pengawet.
            Untuk hidup sehat, aktif, dan seimbang setiap hari.
          </p>

          <p className="text-sm italic text-[#E8C46B]">
            “Explore the Taste, Explore the World.”
          </p>
        </div>

        {/* MENU */}
        <div>
          <h5 className="font-semibold text-white mb-4 text-lg">
            Menu
          </h5>

          <ul className="space-y-2.5 text-sm">
            <li><a href="#produk" className="hover:text-[#E8C46B] transition-all duration-300">Produk</a></li>
            <li><a href="#about" className="hover:text-[#E8C46B] transition-all duration-300">Tentang KOJE24</a></li>
            <li><a href="#langganan" className="hover:text-[#E8C46B] transition-all duration-300">Langganan Paket</a></li>
            <li><a href="#testimoni" className="hover:text-[#E8C46B] transition-all duration-300">Testimoni</a></li>
            <li><a href="/bantuan" className="hover:text-[#E8C46B] transition-all duration-300">Pusat Bantuan</a></li>
          </ul>
        </div>

        {/* ASSISTANT */}
        <div>
          <h5 className="font-semibold text-white mb-4 text-lg">
            Bantuan
          </h5>

          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-koje24"))
                }
                className="hover:text-[#E8C46B] transition-colors duration-300"
              >
                KOJE24 Assistant (Chat Cepat)
              </button>
            </li>
            <li>
              <a href="/bantuan" className="hover:text-[#E8C46B] transition-colors duration-300">
                FAQ & Informasi Bantuan
              </a>
            </li>
            <li>
              <a href="mailto:info@koje24.id" className="hover:text-[#E8C46B] transition-colors duration-300">
                Email Support
              </a>
            </li>
          </ul>
        </div>

        {/* SOCIALS */}
        <div>
          <h5 className="font-semibold text-white mb-4 text-lg">
            Hubungi Kami
          </h5>

          <div className="space-y-3 text-sm">

            <a
              href="https://wa.me/6282213139580"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[#E8C46B] transition-all"
            >
              <FaWhatsapp className="text-xl" /> WhatsApp Order
            </a>

            <a
              href="https://instagram.com/koje24"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[#E8C46B] transition-all"
            >
              <FaInstagram className="text-xl" /> Instagram
            </a>

            <a
              href="https://tiktok.com/@koje24"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[#E8C46B] transition-all"
            >
              <FaTiktok className="text-xl" /> TikTok
            </a>

            <div className="pt-2">
              <span className="block">Email:</span>
              <a
                href="mailto:info@koje24.id"
                className="hover:text-[#E8C46B] transition-colors duration-300"
              >
                info@koje24.id
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10 pt-6 text-center relative z-10">
        <p className="text-gray-400 text-xs md:text-sm tracking-wide leading-relaxed">
          © 2025 <span className="text-[#E8C46B] font-semibold">KOJE24</span> • All Rights Reserved  
          <br className="md:hidden" />
          <span className="text-[#0FA3A8]"> Natural Cold-Pressed Juice Indonesia</span>
        </p>
      </div>

      {/* BACKGROUND DECOR */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#0FA3A8]/10 blur-[120px] rounded-full" />
    </footer>
  )
}
