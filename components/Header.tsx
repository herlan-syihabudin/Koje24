"use client"
import { useState, useEffect } from "react"
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"
import Link from "next/link"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // 🔹 Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 🔹 Lock body scroll ketika menu mobile dibuka
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto"
  }, [menuOpen])

  // 🔹 Smooth scroll ke anchor
  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80, // offset biar gak ketutup header
        behavior: "smooth",
      })
    }
  }

  const navItems = [
    { label: "Produk", href: "#produk" },
    { label: "Tentang KOJE24", href: "#about" },
    { label: "Langganan", href: "#langganan" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "FAQ", href: "#faq" },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        isScrolled ? "bg-white/90 backdrop-blur-xl shadow-md" : "bg-transparent"
      }`}
    >
      {isScrolled && (
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#0FA3A8]/20 to-[#0B4B50]/20" />
      )}

      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-5 md:px-10 transition-all duration-500">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => {
            setMenuOpen(false)
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className={`text-2xl font-playfair font-bold transition-colors duration-500 ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          }`}
        >
          KOJE
          <span
            className={`${isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}`}
          >
            24
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`font-medium transition-all duration-300 ${
                isScrolled
                  ? "text-[#0B4B50] hover:text-[#0FA3A8]"
                  : "text-white hover:text-[#E8C46B]"
              }`}
            >
              {item.label}
            </a>
          ))}

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

        {/* Mobile Icon */}
        <button
          className={`md:hidden text-2xl transition-colors ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ${
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavClick(item.href)}
            className="text-xl font-semibold text-[#0B4B50] my-3 hover:text-[#0FA3A8] transition-colors"
          >
            {item.label}
          </button>
        ))}
        <a
          href="https://wa.me/6282213139580"
          target="_blank"
          onClick={() => setMenuOpen(false)}
          className="mt-6 flex items-center gap-2 bg-[#0FA3A8] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#0B4B50] transition-all"
        >
          <FaWhatsapp /> Chat Sekarang
        </a>
      </div>
    </header>
  )
}
