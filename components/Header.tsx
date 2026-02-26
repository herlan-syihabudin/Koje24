"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingCart, Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";

// Constants
const NAV_ITEMS = [
  { label: "Produk", href: "#produk" },
  { label: "Tentang KOJE24", href: "#about" },
  { label: "Langganan", href: "#langganan" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Bantuan", href: "/pusat-bantuan" },
] as const;

const SCROLL = {
  SCROLLED: 20,
  SHRINK: 80,
  MOBILE_SHRINK: 65,
  DESKTOP_SHRINK: 110,
  MENU_ANIMATION: 180,
} as const;

const COLORS = {
  primary: "#0FA3A8",
  secondary: "#0B4B50",
  accent: "#E8C46B",
} as const;

// Safe event dispatcher
const dispatchEvent = (eventName: string, detail?: any) => {
  if (typeof window === 'undefined') return;
  try {
    const event = detail 
      ? new CustomEvent(eventName, { detail })
      : new Event(eventName);
    window.dispatchEvent(event);
  } catch (error) {
    console.warn(`Failed to dispatch ${eventName}:`, error);
  }
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimate, setMenuAnimate] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  // Check user motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Scroll handler dengan throttle sederhana
  useEffect(() => {
    if (menuOpen) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled(y > SCROLL.SCROLLED);
          setShrink(y > SCROLL.SHRINK);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Body lock dengan cleanup
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("body-menu-lock");
    } else {
      document.body.classList.remove("body-menu-lock");
    }
    
    return () => {
      document.body.classList.remove("body-menu-lock");
    };
  }, [menuOpen]);

  // Menu handlers
  const openMenu = useCallback(() => {
    setMenuOpen(true);
    if (!prefersReducedMotion) {
      requestAnimationFrame(() => setMenuAnimate(true));
    } else {
      setMenuAnimate(true);
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [prefersReducedMotion]);

  const closeMenu = useCallback(() => {
    if (!prefersReducedMotion) {
      setMenuAnimate(false);
      setTimeout(() => setMenuOpen(false), SCROLL.MENU_ANIMATION);
    } else {
      setMenuAnimate(false);
      setMenuOpen(false);
    }
  }, [prefersReducedMotion]);

  // Scroll to section dengan dynamic offset
  const scrollToSection = useCallback((href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    
    const headerHeight = shrink ? SCROLL.MOBILE_SHRINK : SCROLL.DESKTOP_SHRINK;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    
    window.scrollTo({ 
      top: y, 
      behavior: prefersReducedMotion ? 'auto' : 'smooth' 
    });
  }, [shrink, prefersReducedMotion]);

  // Navigation handler
  const navClick = useCallback((href: string) => {
    dispatchEvent("close-testimoni-modal");
    closeMenu();

    if (href.startsWith("#")) {
      setTimeout(() => scrollToSection(href), prefersReducedMotion ? 0 : 240);
      return;
    }

    router.push(href);
  }, [closeMenu, scrollToSection, router, prefersReducedMotion]);

  // Dynamic classes dengan useMemo
  const headerClasses = useMemo(() => {
    if (menuOpen) return "fixed top-0 w-full z-[200] bg-transparent py-5";
    
    return `
      fixed top-0 w-full z-[200]
      transition-all duration-700
      ${isScrolled 
        ? "backdrop-blur-xl bg-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.05)]" 
        : "bg-transparent"
      }
      ${shrink ? "py-2" : "py-5"}
    `;
  }, [menuOpen, isScrolled, shrink]);

  const logoClasses = useMemo(() => {
    if (menuOpen) return "font-playfair font-bold transition-all duration-700 text-xl text-white";
    return `
      font-playfair font-bold transition-all duration-700
      ${shrink ? "text-xl" : "text-2xl"}
      ${isScrolled ? "text-[#0B4B50]" : "text-white"}
    `;
  }, [menuOpen, shrink, isScrolled]);

  const getTextColor = useCallback((baseClass = "text-white") => {
    if (menuOpen) return "text-white";
    if (isScrolled) return "text-[#0B4B50]";
    return baseClass;
  }, [menuOpen, isScrolled]);

  return (
    <header className={headerClasses}>
      {isScrolled && !menuOpen && (
        <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-[#0FA3A8]/40 via-[#0B4B50]/40 to-[#0FA3A8]/40" />
      )}

      <div
        className={`
          max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10
          ${shrink && !menuOpen ? "h-[60px]" : "h-[82px]"}
          transition-all duration-700
        `}
      >
        {/* LOGO */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            dispatchEvent("close-testimoni-modal");
            closeMenu();
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          }}
          className={logoClasses}
        >
          KOJE
          <span
            className={
              menuOpen
                ? "text-[#E8C46B]"
                : isScrolled
                ? "text-[#0FA3A8]"
                : "text-[#E8C46B]"
            }
          >
            24
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href)}
              className={`
                font-medium transition-all duration-300
                ${getTextColor()}
                ${!menuOpen && isScrolled && "hover:text-[#0FA3A8]"}
                ${!menuOpen && !isScrolled && "hover:text-[#E8C46B]"}
              `}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => dispatchEvent("open-cart")}
            className="relative"
            aria-label={`Cart with ${totalQty} items`}
          >
            <ShoppingCart
              size={24}
              className={getTextColor()}
            />
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E8C46B] text-[#0B4B50] text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {totalQty}
              </span>
            )}
          </button>

          {/* CHAT DESKTOP */}
          <button
            onClick={() => dispatchEvent("open-chat")}
            className={`
              ml-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-md transition-all
              ${menuOpen
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

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={openMenu}
          className={`md:hidden text-2xl ${getTextColor()}`}
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          className={`
            fixed inset-0 z-[300] flex flex-col items-center justify-center gap-8
            bg-white/95 backdrop-blur-xl
            transition-all duration-300
            ${menuAnimate
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
            }
          `}
        >
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 text-3xl text-[#0B4B50] hover:text-[#0FA3A8]"
            aria-label="Close menu"
          >
            <X size={32} />
          </button>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href)}
              className="text-3xl font-semibold text-[#0B4B50] hover:text-[#0FA3A8] transition-all"
            >
              {item.label}
            </button>
          ))}

          {/* CHAT MOBILE */}
          <button
            onClick={() => {
              closeMenu();
              dispatchEvent("open-chat");
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
  );
}
