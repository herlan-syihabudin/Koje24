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
};

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

// Debounce utility
const debounce = (fn: Function, ms: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  // Mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefetch untuk performa
  useEffect(() => {
    if (mounted) {
      router.prefetch('/pusat-bantuan');
    }
  }, [router, mounted]);

  // Check user motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Deteksi halaman & active link
  useEffect(() => {
    const checkPage = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      setIsHomePage(path === '/');
      
      if (path === '/pusat-bantuan') setActiveLink('Bantuan');
      else if (hash === '#produk') setActiveLink('Produk');
      else if (hash === '#about') setActiveLink('Tentang KOJE24');
      else if (hash === '#langganan') setActiveLink('Langganan');
      else if (hash === '#testimoni') setActiveLink('Testimoni');
      else setActiveLink('');
    };
    
    checkPage();
    window.addEventListener('popstate', checkPage);
    window.addEventListener('hashchange', checkPage);
    return () => {
      window.removeEventListener('popstate', checkPage);
      window.removeEventListener('hashchange', checkPage);
    };
  }, []);

  // Scroll handler with debounce for performance
  useEffect(() => {
    if (menuOpen) return;

    const handleScroll = debounce(() => {
      const y = window.scrollY;
      setIsScrolled(y > SCROLL.SCROLLED);
      setShrink(y > SCROLL.SHRINK);
    }, 16);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Body lock
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("body-menu-lock");
    } else {
      document.body.classList.remove("body-menu-lock");
    }
    return () => document.body.classList.remove("body-menu-lock");
  }, [menuOpen]);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Scroll to section
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
  const navClick = useCallback((href: string, label: string) => {
    dispatchEvent("close-testimoni-modal");
    closeMenu();
    setActiveLink(label);

    if (href.startsWith("#")) {
      if (window.location.pathname === '/') {
        setTimeout(() => scrollToSection(href), 100);
        return;
      }
      router.push('/');
      setTimeout(() => scrollToSection(href), 300);
      return;
    }

    router.push(href);
  }, [closeMenu, router, scrollToSection]);

  // Header classes
  const headerClasses = useMemo(() => {
    if (!mounted) return "fixed top-0 w-full z-[200] bg-white py-5";
    if (menuOpen) return "fixed top-0 w-full z-[200] bg-white py-5 shadow-md";
    
    if (!isHomePage) {
      return `
        fixed top-0 w-full z-[200]
        transition-all duration-300
        bg-white shadow-md
        ${shrink ? "py-2" : "py-5"}
      `;
    }
    
    return `
      fixed top-0 w-full z-[200]
      transition-all duration-300
      ${isScrolled
        ? "bg-white shadow-md" 
        : "bg-transparent"
      }
      ${shrink ? "py-2" : "py-5"}
    `;
  }, [menuOpen, isScrolled, shrink, isHomePage, mounted]);

  // Logo classes
  const logoClasses = useMemo(() => {
    if (!mounted) return "font-playfair font-bold text-2xl text-gray-800";
    if (menuOpen) return "font-playfair font-bold text-2xl text-gray-800";
    
    if (!isHomePage) {
      return `font-playfair font-bold transition-all duration-300 ${shrink ? "text-xl" : "text-2xl"} text-gray-800`;
    }
    
    return `font-playfair font-bold transition-all duration-300 ${shrink ? "text-xl" : "text-2xl"} ${isScrolled ? "text-gray-800" : "text-white"}`;
  }, [menuOpen, shrink, isScrolled, isHomePage, mounted]);

  const logoSpanClasses = useMemo(() => {
    if (!mounted) return "text-[#0FA3A8]";
    if (menuOpen) return "text-[#0FA3A8]";
    if (!isHomePage) return "text-[#0FA3A8]";
    if (isScrolled) return "text-[#0FA3A8]";
    return "text-[#E8C46B]";
  }, [menuOpen, isHomePage, isScrolled, mounted]);

  // Text color
  const getTextColor = useCallback(() => {
    if (!mounted) return "text-gray-800";
    if (menuOpen) return "text-gray-800";
    if (!isHomePage) return "text-gray-800";
    if (isScrolled) return "text-gray-800";
    return "text-white";
  }, [menuOpen, isScrolled, isHomePage, mounted]);

  const getButtonBg = useCallback(() => {
    if (!mounted) return "bg-[#0FA3A8] text-white";
    if (menuOpen) return "bg-[#0FA3A8] text-white";
    if (!isHomePage) return "bg-[#0FA3A8] text-white";
    if (isScrolled) return "bg-[#0FA3A8] text-white";
    return "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30";
  }, [menuOpen, isScrolled, isHomePage, mounted]);

  if (!mounted) return null;

  return (
    <header className={headerClasses}>
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-gray-800 px-4 py-2 rounded-lg z-[10000] shadow-lg">
        Langsung ke konten utama
      </a>

      <div
        className={`
          max-w-7xl mx-auto flex items-center justify-between px-4 md:px-10
          ${shrink && !menuOpen ? "h-[52px]" : "h-[70px]"}
          transition-all duration-300
        `}
      >
        {/* LOGO */}
        <Link
          href="/"
          onClick={() => {
            dispatchEvent("close-testimoni-modal");
            closeMenu();
            setActiveLink('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group relative"
        >
          <span className={logoClasses}>
            KOJE
            <span className={logoSpanClasses}>24</span>
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href, item.label)}
              className={`
                text-sm lg:text-base font-medium transition-all duration-300
                ${getTextColor()}
                ${activeLink === item.label ? 'text-[#0FA3A8] font-semibold' : ''}
                hover:text-[#0FA3A8]
              `}
            >
              {item.label}
            </button>
          ))}

          {/* Cart Button */}
          <button
            onClick={() => dispatchEvent("open-cart")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
            aria-label={`Cart with ${totalQty()} items`}
          >
            <ShoppingCart size={20} className={getTextColor()} />
            {totalQty() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0FA3A8] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg">
               {totalQty() > 9 ? '9+' : totalQty()}
              </span>
            )}
          </button>

          {/* Chat Button */}
          <button
            onClick={() => dispatchEvent("open-chat")}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300
              ${getButtonBg()}
            `}
          >
            <MessageCircle size={16} />
            <span className="hidden lg:inline">Chat</span>
          </button>
        </nav>

        {/* MOBILE: Cart & Menu Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => dispatchEvent("open-cart")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
            aria-label={`Cart with ${totalQty()} items`}
          >
            <ShoppingCart size={22} className={getTextColor()} />
            {totalQty() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0FA3A8] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg">
                {totalQty() > 9 ? '9+' : totalQty()}
              </span>
            )}
          </button>

          <button
            onClick={openMenu}
            className="p-2 rounded-full hover:bg-gray-100 transition-all"
            aria-label="Open menu"
          >
            <Menu size={24} className={getTextColor()} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU - BOTTOM SHEET */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={closeMenu} />
          
          <div
            className={`
              fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl
              transition-all duration-300 ease-out transform
            `}
            style={{
              transform: menuOpen ? 'translateY(0)' : 'translateY(100%)',
              opacity: menuOpen ? 1 : 0,
            }}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="font-playfair text-xl font-bold text-gray-800">
                KOJE<span className="text-[#0FA3A8]">24</span>
              </span>
              <button
                onClick={closeMenu}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navClick(item.href, item.label)}
                  className={`
                    w-full text-left px-4 py-4 rounded-xl text-lg font-medium
                    transition-all duration-200
                    ${activeLink === item.label 
                      ? 'bg-gradient-to-r from-[#0FA3A8]/10 to-[#0B4B50]/10 text-[#0FA3A8] font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#0FA3A8]'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => {
                  closeMenu();
                  dispatchEvent("open-chat");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle size={20} />
                Chat Customer Service
              </button>
            </div>

            <div className="p-5 pt-0 pb-8 text-center text-xs text-gray-400">
              © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
