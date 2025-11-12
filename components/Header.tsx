"use client"
import { useState, useEffect } from "react"
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"
import Link from "next/link"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [canClick, setCanClick] = useState(true)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto"
  }, [menuOpen])

  const navItems = [
    { label: "Produk", href: "#produk" },
    { label: "Tentang KOJE24", href: "#about" },
    { label: "Langganan", href: "#langganan" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "FAQ", href: "#faq" },
  ]

  const safeAction = (callback: () => void) => {
    if (!canClick) return
    setCanClick(false)
    callback()
    setTimeout(() => setCanClick(true), 400) // gak ngunci lama
  }

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    safeAction(() => {
      setMenuOpen(false)
      setTimeout(() => {
        const target = document.querySelector(href)
        if (target) {
          const offset = 80
          const y = target.getBoundingClientRect().top + window.scrollY - offset
          window.scrollTo({ top: y, behavior: "smooth" })
        }
      }, 350)
    })
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
            safeAction(() => {
              setMenuOpen(false)
              window.scrollTo({ top: 0, behavior: "smooth" })
            })
          }}
          className={`text-2xl font-playfair font-bold transition-colors duration-500 ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          }`}
        >
          KOJE<span className={`${isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}`}>24</span>
        </Link>

        {/* DESKTOP */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
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

        {/* MOBILE BUTTON */}
        <button
          disabled={!canClick}
          className={`md:hidden text-2xl transition-colors ${
            isScrolled ? "text-[#0B4B50]" : "text-white"
          } ${!canClick ? "opacity-60" : ""}`}
          onClick={() => safeAction(() => setMenuOpen(true))}
        >
          <FaBars />
        </button>
      </div>

      {/* MOBILE FULLSCREEN MENU */}
<div
  className={`fixed inset-0 z-[999] flex flex-col justify-center items-center text-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
    menuOpen
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 translate-y-5 pointer-events-none"
  }`}
  style={{
    background:
      "linear-gradient(to bottom, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.9) 100%)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
  }}
>
  {/* Tombol Close */}
  <button
    onClick={() => {
      setMenuOpen(false)
      document.body.style.overflow = "auto"
      window.scrollTo({ top: 0, behavior: "smooth" })
    }}
    className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8] transition-all"
  >
    <FaTimes />
  </button>

  {/* Isi Navigasi */}
  <div className="flex flex-col gap-6">
    {navItems.map((item) => (
      <button
  key={item.href}
  onClick={(e) => handleNavClick(e, item.href)}
  className="text-2xl font-semibold text-[#0B4B50] hover:text-[#0FA3A8] transition-all"
>
  {item.label}
</button>
    ))}

    <a
      href="https://wa.me/6282213139580"
      target="_blank"
      onClick={() => setMenuOpen(false)}
      className="mt-10 flex items-center justify-center gap-2 bg-[#0FA3A8] text-white px-8 py-3 rounded-full shadow-lg hover:bg-[#0B4B50] transition-all"
    >
      <FaWhatsapp /> Chat Sekarang
    </a>
  </div>

  {/* Footer Branding */}
  <div className="absolute bottom-6 text-sm text-gray-500">
    © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span> • Explore the Taste, Explore the World
  </div>
</div>

