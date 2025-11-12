"use client"
import { useState, useEffect, useRef } from "react"
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"
import Link from "next/link"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [animating, setAnimating] = useState(false) // guard anti “setengah terbuka”
  const closeTimer = useRef<number | null>(null)

  // efek scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // lock scroll body saat menu terbuka
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [menuOpen])

  // helper open/close dengan guard animasi (durasi harus match class transition 500ms)
  const openMenu = () => {
    if (animating || menuOpen) return
    setAnimating(true)
    setMenuOpen(true)
    window.setTimeout(() => setAnimating(false), 520)
  }
  const closeMenu = () => {
    if (animating || !menuOpen) return
    setAnimating(true)
    setMenuOpen(false)
    // bersihkan timer sebelumnya
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setAnimating(false), 520)
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
    const offset = 80 // tinggi header
    const topPos = target.getBoundingClientRect().top + window.scrollY - offset
    // pastikan jalan setelah overlay benar2 hilang
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: topPos, behavior: "smooth" })
      })
    }, 360) // sedikit < 520ms agar mulai tepat setelah fade
  }

  const handleNavClick = (href: string) => {
    closeMenu()               // tutup overlay dulu
    smoothScrollTo(href)      // baru scroll ke target
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
        {/* LOGO */}
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
          KOJE<span className={`${isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}`}>24</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()          // ⛔️ hentikan scroll default anchor
                handleNavClick(item.href)   // ✅ pakai scroll manual + offset
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

        {/* MOBILE MENU BUTTON */}
        <button
          className={`md:hidden text-2xl transition-colors ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          } ${animating ? "pointer-events-none opacity-80" : ""}`}
          onClick={openMenu}
          aria-label="Buka menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <FaBars />
        </button>
      </div>

      {/* MOBILE FULLSCREEN MENU */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[999] bg-white/80 backdrop-blur-2xl flex flex-col items-center justify-center text-center transition-all duration-500 ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto visible"
            : "opacity-0 -translate-y-10 pointer-events-none invisible"
        }`}
      >
        {/* Tombol Close */}
        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8] transition-all"
          aria-label="Tutup menu"
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
