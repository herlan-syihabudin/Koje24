"use client";

import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      setShrink(y > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body lock
  const lockBody = () => document.body.classList.add("body-lock");
  const unlockBody = () => document.body.classList.remove("body-lock");

  const openMenu = () => {
    setMenuOpen(true);
    window.scrollTo({ top: 0 });
    lockBody();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setTimeout(unlockBody, 150);
  };

  // Scroll to section
  const scrollToSection = (href: string) => {
    const target = document.querySelector(href);
    if (!target) return;

    const offset = shrink ? 65 : 110;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const navClick = (href: string) => {
    closeMenu();
    if (href.startsWith("/")) {
      router.push(href);
      return;
    }
    setTimeout(() => scrollToSection(href), 200);
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
      className={`
        fixed top-0 w-full z-[200] transition-all duration-700
        ${isScrolled ? "backdrop-blur-xl bg-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.05)]" : "bg-transparent"}
        ${shrink ? "py-2" : "py-5"}
      `}
    >
      {/* bottom gradient line */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-[#0FA3A8]/40 via-[#0B4B50]/40 to-[#0FA3A8]/40" />
      )}

      <div className={`max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 transition-all duration-700 ${shrink ? "h-[60px]" : "h-[82px]"}`}>
        
        {/* LOGO */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            closeMenu();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`
            font-playfair font-bold transition-all duration-700
            ${shrink ? "text-xl" : "text-2xl"}
            ${isScrolled ? "text-[#0B4B50]" : "text-white"}
          `}
        >
          KOJE
          <span className={isScrolled ? "text-[#0FA3A8]" : "text-[#E8C46B]"}>24</span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8">

          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href)}
              className={`
                relative font-medium transition-all duration-300
                ${isScrolled ? "text-[#0B4B50] hover:text-[#0FA3A8]" : "text-white hover:text-[#E8C46B]"}
              `}
            >
              {item.label}

              {/* underline animation */}
              <span
                className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#E8C46B] transition-all duration-300 group-hover:w-full"
              ></span>
            </button>
          ))}

          {/* CART */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
            className="relative"
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
            className={`
              ml-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-md transition-all
              ${isScrolled ? "bg-[#0FA3A8] text-white hover:bg-[#0B4B50]" : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"}
            `}
          >
            <FaWhatsapp /> Chat
          </a>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={openMenu}
          className={`md:hidden text-2xl ${isScrolled ? "text-[#0B4B50]" : "text-white"}`}
        >
          <FaBars />
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[300] flex flex-col items-center justify-center gap-8 transition-all">
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8]"
          >
            <FaTimes />
          </button>

          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href)}
              className="text-3xl font-semibold text-[#0B4B50] hover:text-[#0FA3A8] transition-all"
            >
              {item.label}
            </button>
          ))}

          <a
            href="https://wa.me/6282213139580"
            target="_blank"
            className="mt-10 flex items-center justify-center gap-2 px-10 py-3 bg-[#0FA3A8] text-white rounded-full text-xl hover:bg-[#0B4B50] transition-all shadow-xl"
          >
            <FaWhatsapp /> Chat Sekarang
          </a>

          <div className="absolute bottom-8 text-sm text-gray-500">
            © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span>
          </div>
        </div>
      )}
    </header>
  );
}
