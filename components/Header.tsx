"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [open, setOpen] = useState(false)

  // 🔹 Tutup otomatis saat lebar layar melewati breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navItems = [
    { name: "Produk", href: "#produk" },
    { name: "Tentang KOJE24", href: "#about" },
    { name: "Langganan", href: "#langganan" },
    { name: "Testimoni", href: "#testimoni" },
    { name: "FAQ", href: "#faq" },
  ]

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 md:px-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="KOJE24"
            width={40}
            height={40}
            className="rounded-full ring-2 ring-[#E8C46B]/50"
          />
          <span className="font-playfair text-xl font-bold text-[#0B4B50] tracking-tight">
            KOJE24
          </span>
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#0B4B50] text-3xl focus:outline-none transition-transform duration-300"
          aria-label="Toggle menu"
        >
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HiOutlineX />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HiOutlineMenu />
            </motion.div>
          )}
        </button>

        {/* ✅ Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[#0B4B50] hover:text-[#0FA3A8] font-medium transition-colors duration-300"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ✅ Mobile Navigation */}
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <motion.div
                key="overlay"
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Menu Drawer */}
              <motion.nav
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-screen w-3/4 sm:w-1/2 bg-white z-50 shadow-2xl p-8 flex flex-col justify-center items-center space-y-6"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-[#0B4B50] hover:text-[#0FA3A8] text-lg font-semibold transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
