"use client"
import { useState, useEffect } from "react"
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"
import Link from "next/link"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Produk", href: "#produk" },
    { label: "Tentang Kami", href: "#tentang" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "Kontak", href: "#kontak" },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-md"
          : "bg-transparent"
      }`}
    >
      {/* Border bawah halus */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#0FA3A8]/20 to-[#0B4B50]/20" />
      )}

      <div className="container mx-auto flex justify-between items-center py-3 md:py-4 px-5 md:px-10 transition-all duration-500">
        {/* LOGO */}
        <Link
          href="/"
          className={`text-2xl font-playfair font-bold transition-colors duration-500 ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          }`}
        >
          KOJE<span className={`${isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}`}>24</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-medium transition-all duration-300 ${
                isScrolled
                  ? "text-[#0B4B50] hover:text-[#0FA3A8]"
                  : "text-white hover:text-[#E8C46B]"
              }`}
            >
              {item.label}
            </a>
          ))}

          {/* WA BUTTON */}
          <a
            href="https://wa.me/6282213139580"
            target="_blank"
            className={`ml-4 flex items-center gap-2 text-sm leading-tight px-4 py-2 rounded-full shadow-md transition-all ${
              isScrolled
                ? "bg-[#0FA3A8] text-white hover:bg-[#0B4B50]"
                : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
            }`}
          >
            <FaWhatsapp /> Chat Sekarang
          </a>
        </nav>

        {/* MOBILE MENU ICON */}
        <button
          className={`md:hidden text-2xl transition-colors ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ${
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className="text-xl font-semibold text-[#0B4B50] my-3 hover:text-[#0FA3A8] transition-colors"
          >
            {item.label}
          </a>
        ))}
        <a
          href="https://wa.me/6282213139580"
          target="_blank"
          className="mt-6 flex items-center gap-2 bg-[#0FA3A8] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#0B4B50] transition-all"
        >
          <FaWhatsapp /> Chat Sekarang
        </a>
      </div>
    </header>
  )
}
