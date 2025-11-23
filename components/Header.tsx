"use client";

import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // BODY LOCK
  const lockBody = () => {
    document.body.classList.add("body-lock");
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.background = "transparent";
  };

  const unlockBody = () => {
    document.body.classList.remove("body-lock");
    document.body.style.overflow = "auto";
    document.body.style.position = "static";
    document.body.style.background = "transparent";
  };

  const openMenu = () => {
    setMenuOpen(true);
    window.scrollTo({ top: 0 });
    lockBody();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    unlockBody();
  };

  // SMART SCROLL
  const scrollToSection = (href: string) => {
    const target = document.querySelector(href);
    if (!target) return;

    const headerOffset = isScrolled ? 78 : 120;
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const navClick = (href: string) => {
    closeMenu();

    if (href.startsWith("/")) {
      router.push(href);
      return;
    }

    setTimeout(() => scrollToSection(href), 180);
  };

  const navItems = [
    { label: "Produk", href: "#produk" },
    { label: "Tentang KOJE24", href: "#about" },
    { label: "Langganan", href: "#langganan" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "Bantuan", href: "/pusat-bantuan" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-700
        ${isScrolled ? "bg-white/90 backdrop-blur-xl shadow-md" : "bg-transparent"}
      `}
    >
      {isScrolled && (
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#0FA3A8]/20 to-[#0B4B50]/20" />
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-5 md:px-10">

        {/* LOGO */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            closeMenu();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`text-2xl font-playfair font-bold transition-colors duration-500
            ${isScrolled ? "text-[#0B4B50]" : "text-white"}
          `}
        >
          KOJE
          <span className={isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}>24</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href)}
              className={`font-medium transition-all duration-300 ${
                isScrolled
                  ? "text-[#0B4B50] hover:text-[#0FA3A8]"
                  : "text-white hover:text-[#E8C46B]"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* CART */}
          <button
            aria-label="Buka keranjang"
            className="relative"
            onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
          >
            <ShoppingCart size={24} className={isScrolled ? "text-[#0B4B50]" : "text-white"} />
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50] text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {totalQty}
              </span>
            )}
          </button>

          {/* WA BUTTON */}
          <a
            href="https://wa.me/6282213139580"
            target="_blank"
            className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-md transition-all
              ${isScrolled
                ? "bg-[#0FA3A8] text-white hover:bg-[#0B4B50]"
                : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
              }
            `}
          >
            <FaWhatsapp /> Chat Sekarang
          </a>
        </nav>

        {/* MOBILE BURGER */}
        <button
          onClick={openMenu}
          className={`md:hidden text-2xl transition-colors 
            ${isScrolled ? "text-[#0B4B50]" : "text-white"}
          `}
        >
          <FaBars />
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          className="
            fixed left-0 top-0 
            w-screen 
            h-[100dvh]
            z-[200]
            flex flex-col items-center justify-center
            bg-white/90 backdrop-blur-2xl
            transition-all duration-300
          "
        >
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8]"
          >
            <FaTimes />
          </button>

          <div className="flex flex-col gap-6 text-[#0B4B50]">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navClick(item.href)}
                className="text-2xl font-semibold hover:text-[#0FA3A8] transition-all"
              >
                {item.label}
              </button>
            ))}

            <a
              href="https://wa.me/6282213139580"
              target="_blank"
              className="mt-10 flex items-center justify-center gap-2 px-8 py-3 rounded-full
                bg-[#0FA3A8] text-white hover:bg-[#0B4B50] transition-all shadow-lg"
            >
              <FaWhatsapp /> Chat Sekarang
            </a>
          </div>

          <div className="absolute bottom-6 text-sm text-gray-500">
            © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span>
          </div>
        </div>
      )}
    </header>
  );
}
