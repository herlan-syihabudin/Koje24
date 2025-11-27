"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const totalQty = useCartStore((s) => s.totalQty)

  // 🔥 Scroll listener — aman & clean
  useEffect(() => {
    if (menuOpen) return

    const handleScroll = () => setIsScrolled(window.scrollY > 5)
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [menuOpen])

  // 🔥 Open cart tetap pakai event yang sudah berjalan
  const openCart = () => window.dispatchEvent(new Event("open-cart"))

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-40 transition-all duration-300
        ${isScrolled ? "bg-white/95 shadow-md backdrop-blur-lg" : "bg-transparent"}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-10">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image
            src="/logo.png"
            alt="KOJE24 • Natural Cold-Pressed Juice"
            width={38}
            height={38}
            className="object-contain"
            priority
          />
          <span className="font-semibold text-[#0B4B50] text-lg hidden sm:block">
            KOJE24
          </span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
          <a href="#produk" className="hover:text-[#0FA3A8] transition">Produk</a>
          <a href="#about" className="hover:text-[#0FA3A8] transition">Tentang</a>
          <a href="#paket" className="hover:text-[#0FA3A8] transition">Paket</a>
          <a href="#testimoni" className="hover:text-[#0FA3A8] transition">Testimoni</a>
          <a href="#faq" className="hover:text-[#0FA3A8] transition">FAQ</a>
        </nav>

        {/* AKSI KANAN */}
        <div className="flex items-center gap-4">
          {/* WA */}
          <a
            href="https://wa.me/628xxxxxxxxxx?text=Halo+KOJE24"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline text-[#0B4B50] hover:text-[#0FA3A8] font-medium"
          >
            WhatsApp
          </a>

          {/* CART */}
          <button
            onClick={openCart}
            aria-label="Buka keranjang"
            className="relative"
          >
            <ShoppingCart className="w-6 h-6 text-[#0B4B50]" />
            {totalQty > 0 && (
              <span className="
                absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50] text-xs font-bold
                rounded-full min-w-[18px] h-[18px] flex items-center justify-center
              ">
                {totalQty}
              </span>
            )}
          </button>

          {/* HAMBURGER */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu navigasi"
            className="md:hidden"
          >
            <Menu className="w-7 h-7 text-[#0B4B50]" />
          </button>
        </div>
      </div>

      {/* NAV MOBILE */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="
            fixed inset-0 bg-white z-50 flex flex-col p-8 gap-5 text-lg
            animate-[fadeIn_0.2s_ease-out]
          "
        >
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup menu navigasi"
            className="absolute top-6 right-6"
          >
            <X className="w-7 h-7 text-[#0B4B50]" />
          </button>

          <a href="#produk" onClick={() => setMenuOpen(false)}>Produk</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Tentang</a>
          <a href="#paket" onClick={() => setMenuOpen(false)}>Paket</a>
          <a href="#testimoni" onClick={() => setMenuOpen(false)}>Testimoni</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>

          {/* WA MOBILE */}
          <a
            href="https://wa.me/628xxxxxxxxxx?text=Halo+KOJE24"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 font-semibold text-[#0FA3A8]"
          >
            Chat WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
