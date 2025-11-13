"use client"
import { useState, useEffect, useRef } from "react"
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"
import Link from "next/link"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [animating, setAnimating] = useState(false)
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openMenu = () => {
    if (menuOpen || animating) return
    setAnimating(true)

    // 🔹 Reset posisi overlay & cegah offset
    window.scrollTo({ top: 0 })
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    setMenuOpen(true)
    setTimeout(() => setAnimating(false), 600)
  }

  const closeMenu = () => {
    if (!menuOpen || animating) return
    setAnimating(true)

    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setMenuOpen(false)
      setAnimating(false)

      // 🔹 Pastikan scroll & overflow balik normal
      document.body.style.overflow = "auto"
      document.documentElement.style.overflow = "auto"
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    }, 550)
  }

  const navItems = [
    { label: "Produk", href: "#produk" },
    { label: "Tentang KOJE24", href: "#about" },
    { label: "Langganan", href: "#langganan" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "FAQ", href: "#faq" },
  ]

  const smoothScrollTo = (href: string) => {
    const target = document.querySelector(href)
    if (!target) return
    const offset = 80
    const y = target.getBoundingClientRect().top + window.scrollY - offset
    setTimeout(() => {
      window.scrollTo({ top: y, behavior: "smooth" })
    }, 360)
  }

  // 🔧 Scroll ditunda setelah animasi tutup selesai
  const handleNavClick = (href: string) => {
    closeMenu()
    setTimeout(() => {
      smoothScrollTo(href)
    }, 600)
  }

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-700 ${
        isScrolled ? "bg-white/90 backdrop-blur-xl shadow-md" : "bg-transparent"
      }`}
    >
      {isScrolled && (
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#0FA3A8]/20 to-[#0B4B50]/20" />
      )}

      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-5 md:px-10">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault()
            closeMenu()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className={`text-2xl font-playfair font-bold transition-colors duration-500 ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          }`}
        >
          KOJE<span className={isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}>24</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(item.href)
              }}
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

        <button
          onClick={openMenu}
          className={`md:hidden text-2xl transition-colors ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          } ${animating ? "opacity-60 pointer-events-none" : ""}`}
          aria-label="Buka menu"
          aria-expanded={menuOpen}
        >
          <FaBars />
        </button>
      </div>

      {/* 🔹 Overlay menu mobile */}
      <div
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center text-center transition-all duration-500 menu-fix ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-10 pointer-events-none"
        } bg-white/85 backdrop-blur-2xl`}
      >
        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8] transition-all"
        >
          <FaTimes />
        </button>

        <div className="flex flex-col gap-6 text-[#0B4B50]">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-2xl font-semibold hover:text-[#0FA3A8] transition-all"
            >
              {item.label}
            </button>
          ))}

          <a
            href="https://wa.me/6282213139580"
            target="_blank"
            onClick={closeMenu}
            className="mt-10 flex items-center justify-center gap-2 bg-[#0FA3A8] text-white px-8 py-3 rounded-full shadow-lg hover:bg-[#0B4B50] transition-all"
          >
            <FaWhatsapp /> Chat Sekarang
          </a>
        </div>

        <div className="absolute bottom-6 text-sm text-gray-500">
          © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span> • Explore the Taste, Explore the World
        </div>
      </div>
    </header>
  )
}
