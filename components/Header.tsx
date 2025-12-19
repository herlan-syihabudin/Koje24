"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimate, setMenuAnimate] = useState(false);

  // 🔥 CHAT MODAL STATE (BARU – TIDAK GANGGU LOGIKA LAIN)
  const [openChat, setOpenChat] = useState(false);

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  /* ===========================
     SMART SCROLL LISTENER
  ============================ */
  useEffect(() => {
    if (menuOpen) return;

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      setShrink(y > 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  /* ===========================
     BODY LOCK FIX (IOS SAFE)
  ============================ */
  const lockBody = () => document.body.classList.add("body-menu-lock");
  const unlockBody = () => document.body.classList.remove("body-menu-lock");

  /* ===========================
     OPEN MENU
  ============================ */
  const openMenu = () => {
    setMenuOpen(true);
    requestAnimationFrame(() => setMenuAnimate(true));
    window.scrollTo({ top: 0 });
    lockBody();
  };

  /* ===========================
     CLOSE MENU
  ============================ */
  const closeMenu = () => {
    setMenuAnimate(false);
    unlockBody();
    setTimeout(() => setMenuOpen(false), 180);
  };

  /* ===========================
     SCROLL TO SECTION
  ============================ */
  const scrollToSection = (href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    const offset = shrink ? 65 : 110;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const navClick = (href: string) => {
    window.dispatchEvent(new CustomEvent("close-testimoni-modal"));
    closeMenu();

    if (href.startsWith("#")) {
      setTimeout(() => scrollToSection(href), 240);
      return;
    }

    router.push(href);
  };

  const navItems = [
    { label: "Produk", href: "#produk" },
    { label: "Tentang KOJE24", href: "#about" },
    { label: "Langganan", href: "#langganan" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "Bantuan", href: "/pusat-bantuan" },
  ];

  return (
    <>
      <header
        className={`
          fixed top-0 w-full z-[200]
          ${
            menuOpen
              ? "bg-transparent py-5"
              : isScrolled
              ? "backdrop-blur-xl bg-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-700"
              : "bg-transparent transition-all duration-700"
          }
          ${menuOpen ? "" : shrink ? "py-2" : "py-5"}
        `}
      >
        {isScrolled && !menuOpen && (
          <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-[#0FA3A8]/40 via-[#0B4B50]/40 to-[#0FA3A8]/40" />
        )}

        <div
          className={`max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10
          ${shrink && !menuOpen ? "h-[60px]" : "h-[82px]"}
          transition-all duration-700
        `}
        >
          {/* LOGO */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("close-testimoni-modal"));
              closeMenu();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`
              font-playfair font-bold transition-all duration-700
              ${shrink && !menuOpen ? "text-xl" : "text-2xl"}
              ${
                menuOpen
                  ? "text-white"
                  : isScrolled
                  ? "text-[#0B4B50]"
                  : "text-white"
              }
            `}
          >
            KOJE
            <span
              className={`${
                menuOpen
                  ? "text-[#E8C46B]"
                  : isScrolled
                  ? "text-[#0FA3A8]"
                  : "text-[#E8C46B]"
              }`}
            >
              24
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navClick(item.href)}
                className={`
                  font-medium transition-all duration-300
                  ${
                    menuOpen
                      ? "text-white"
                      : isScrolled
                      ? "text-[#0B4B50] hover:text-[#0FA3A8]"
                      : "text-white hover:text-[#E8C46B]"
                  }
                `}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-cart"))
              }
              className="relative"
            >
              <ShoppingCart
                size={24}
                className={
                  menuOpen
                    ? "text-white"
                    : isScrolled
                    ? "text-[#0B4B50]"
                    : "text-white"
                }
              />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50] text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {totalQty}
                </span>
              )}
            </button>

            {/* 🔥 CHAT BUTTON (DIUBAH – TIDAK KE WA) */}
            <button
              onClick={() => setOpenChat(true)}
              className={`
                ml-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-md transition-all
                ${
                  menuOpen
                    ? "bg-white/20 text-white"
                    : isScrolled
                    ? "bg-[#0FA3A8] text-white hover:bg-[#0B4B50]"
                    : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                }
              `}
            >
              <MessageCircle size={20} /> Chat
            </button>
          </nav>

          {/* MOBILE ICON */}
          <button
            onClick={openMenu}
            className={`
              md:hidden text-2xl
              ${
                menuOpen
                  ? "text-white"
                  : isScrolled
                  ? "text-[#0B4B50]"
                  : "text-white"
              }
            `}
          >
            <Menu size={26} />
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div
            className={`
              fixed inset-0 z-[300] flex flex-col items-center justify-center gap-8
              bg-white/95 backdrop-blur-xl transition-all duration-300
              ${
                menuAnimate
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }
            `}
          >
            <button
              onClick={closeMenu}
              className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8]"
            >
              <X size={32} />
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

            {/* 🔥 CHAT MOBILE */}
            <button
              onClick={() => {
                closeMenu();
                setOpenChat(true);
              }}
              className="mt-10 flex items-center justify-center gap-3 px-10 py-3 bg-[#0FA3A8] text-white rounded-full text-xl hover:bg-[#0B4B50] transition-all shadow-xl"
            >
              <MessageCircle size={28} /> Chat Sekarang
            </button>

            <div className="absolute bottom-8 text-sm text-gray-500">
              © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span>
            </div>
          </div>
        )}
      </header>

      {/* ===========================
          CHAT MODAL (DUMMY – UI ONLY)
      ============================ */}
      {openChat && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-5 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-[#0B4B50]">
                Chat Admin KOJE24
              </h3>
              <button onClick={() => setOpenChat(false)}>✕</button>
            </div>

            <div className="h-[260px] bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-sm text-gray-400">
              Chat siap digunakan
            </div>

            <input
              placeholder="Tulis pertanyaan kamu..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
            />
          </div>
        </div>
      )}
    </>
  );
}
