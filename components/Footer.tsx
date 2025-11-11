"use client"
import Image from "next/image"
import Link from "next/link"
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-[#0B4B50] text-white pt-14 pb-6 px-6 md:px-14 lg:px-24 relative overflow-hidden">
      {/* Wave background (optional aesthetic) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FA3A8] via-[#E8C46B] to-[#0FA3A8]" />

      {/* Top CTA */}
      <div className="text-center mb-10">
        <h3 className="font-playfair text-2xl md:text-3xl font-semibold mb-2">
          Stay Healthy With <span className="text-[#E8C46B]">KOJE24</span>
        </h3>
        <p className="text-gray-300 text-sm md:text-base">
          Minuman alami setiap hari untuk energi dan keseimbangan hidup.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-6 mb-10 text-gray-300">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Image src="/favicon.ico" alt="KOJE24" width={40} height={40} className="rounded-full" />
            <h4 className="font-playfair text-lg font-bold text-white">KOJE24</h4>
          </div>
          <p className="text-sm leading-relaxed mb-2">
            Jus cold-pressed alami tanpa gula dan pengawet.  
            Didesain untuk kamu yang ingin hidup lebih sehat setiap hari.
          </p>
          <p className="text-sm italic text-[#E8C46B]">“Explore the Taste, Explore the World.”</p>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="font-semibold text-white mb-3">Menu</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#produk" className="hover:text-[#E8C46B] transition">Produk</a></li>
            <li><a href="#tentang" className="hover:text-[#E8C46B] transition">Tentang KOJE24</a></li>
            <li><a href="#langganan" className="hover:text-[#E8C46B] transition">Langganan Paket</a></li>
            <li><a href="#testimoni" className="hover:text-[#E8C46B] transition">Testimoni</a></li>
            <li><a href="#faq" className="hover:text-[#E8C46B] transition">FAQ</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h5 className="font-semibold text-white mb-3">Hubungi Kami</h5>
          <ul className="text-sm space-y-2">
            <li>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#E8C46B] transition"
              >
                <FaWhatsapp /> WhatsApp Order
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/koje24"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#E8C46B] transition"
              >
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@koje24"
                target="_blank"
                className="flex items-center gap-2 hover:text-[#E8C46B] transition"
              >
                <FaTiktok /> TikTok
              </a>
            </li>
            <li>Email: <a href="mailto:info@koje24.id" className="hover:text-[#E8C46B]">info@koje24.id</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 pt-4 text-center text-gray-400 text-sm">
        © 2025 <span className="text-[#E8C46B] font-semibold">KOJE24</span>. All rights reserved.
      </div>
    </footer>
  )
}
