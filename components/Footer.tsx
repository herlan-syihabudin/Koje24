"use client"

import Image from "next/image"
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="relative bg-[#0B4B50] text-white pt-16 pb-8 px-6 md:px-14 lg:px-24 overflow-hidden">
      {/* 🌊 Wave Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8]" />

      {/* 💎 Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      {/* 🟢 CTA Header */}
      <div className="text-center mb-12 relative z-10">
        <h3 className="font-playfair text-3xl md:text-4xl font-semibold mb-3 tracking-tight">
          Stay Healthy With <span className="text-[#E8C46B]">KOJE24</span>
        </h3>
        <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Minuman cold-pressed alami setiap hari untuk energi, imunitas, dan keseimbangan hidup 🌿
        </p>
      </div>

      {/* 🧩 Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12 text-gray-300 relative z-10">
        
        {/* 🔹 Brand Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/favicon.ico"
              alt="KOJE24"
              width={44}
              height={44}
              className="rounded-full ring-2 ring-[#E8C46B]/40"
            />
            <h4 className="font-playfair text-xl font-bold text-white tracking-wide">
              KOJE24
            </h4>
          </div>
          <p className="text-sm leading-relaxed mb-3">
            Jus cold-pressed alami tanpa gula tambahan dan tanpa pengawet.
            Didesain untuk kamu yang ingin hidup sehat, aktif, dan seimbang setiap hari.
          </p>
          <p className="text-sm italic text-[#E8C46B]">
            “Explore the Taste, Explore the World.”
          </p>
        </div>

        {/* 🔹 Quick Links */}
        <div>
          <h5 className="font-semibold text-white mb-3">Menu</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#produk" className="hover:text-[#E8C46B] transition-colors duration-300">Produk</a></li>
            <li><a href="#about" className="hover:text-[#E8C46B] transition-colors duration-300">Tentang KOJE24</a></li>
            <li><a href="#langganan" className="hover:text-[#E8C46B] transition-colors duration-300">Langganan Paket</a></li>
            <li><a href="#testimoni" className="hover:text-[#E8C46B] transition-colors duration-300">Testimoni</a></li>
            <li><a href="/bantuan" className="hover:text-[#E8C46B] transition-colors duration-300">Pusat Bantuan</a></li>
          </ul>
        </div>

        {/* 🔹 Bantuan KOJE24 Assistant */}
        <div>
          <h5 className="font-semibold text-white mb-3">Butuh Bantuan?</h5>
          <ul className="space-y-2 text-sm">
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

        {/* 🔹 Contact & Socials */}
        <div>
          <h5 className="font-semibold text-white mb-3">Hubungi Kami</h5>
          <ul className="text-sm space-y-2">
            <li>
              <a
                href="https://wa.me/6282213139580"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#E8C46B] transition-all duration-300"
              >
                <FaWhatsapp className="text-lg" /> WhatsApp Order
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/koje24"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#E8C46B] transition-all duration-300"
              >
                <FaInstagram className="text-lg" /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@koje24"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#E8C46B] transition-all duration-300"
              >
                <FaTiktok className="text-lg" /> TikTok
              </a>
            </li>
            <li>
              <span className="block">Email:</span>
              <a
                href="mailto:info@koje24.id"
                className="hover:text-[#E8C46B] transition-colors duration-300"
              >
                info@koje24.id
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 🔸 Divider */}
      <div className="border-t border-white/10 pt-5 text-center text-gray-400 text-xs md:text-sm tracking-wide relative z-10">
        © 2025{" "}
        <span className="text-[#E8C46B] font-semibold">KOJE24</span> • All Rights Reserved{" "}
        <br className="md:hidden" /> —{" "}
        <span className="text-[#0FA3A8]">
          Natural Cold-Pressed Juice Indonesia
        </span>
      </div>

      {/* 🌿 Blur Accent */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#0FA3A8]/10 blur-[100px] rounded-full" />
    </footer>
  )
}
