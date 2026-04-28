"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingCart, Menu, X, MessageCircle, ChevronDown } from "lucide-react";
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
  const [isHomePage, setIsHomePage] = useState(true);
  const [activeIndicator, setActiveIndicator] = useState<string | null>(null);

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

  // Deteksi halaman dan active indicator
  useEffect(() => {
    const checkPage = () => {
      setIsHomePage(window.location.pathname === '/');
      
      // Set active indicator based on current page
      if (window.location.pathname === '/pusat-bantuan') {
        setActiveIndicator('Bantuan');
      } else if (window.location.hash) {
        const hash = window.location.hash;
        if (hash === '#produk') setActiveIndicator('Produk');
        else if (hash === '#about') setActiveIndicator('Tentang KOJE24');
        else if (hash === '#langganan') setActiveIndicator('Langganan');
        else if (hash === '#testimoni') setActiveIndicator('Testimoni');
        else setActiveIndicator(null);
      } else {
        setActiveIndicator(null);
      }
    };
    
    checkPage();
    window.addEventListener('popstate', checkPage);
    window.addEventListener('hashchange', checkPage);
    return () => {
      window.removeEventListener('popstate', checkPage);
      window.removeEventListener('hashchange', checkPage);
    };
  }, []);

  // Scroll handler
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

  // Body lock
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
    setActiveIndicator(label);

    if (href.startsWith("#")) {
      if (window.location.pathname === '/') {
        let attempts = 0;
        const maxAttempts = 30;
        
        const tryScroll = () => {
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = shrink ? SCROLL.MOBILE_SHRINK : SCROLL.DESKTOP_SHRINK;
            const y = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryScroll, 100);
          }
        };
        
        setTimeout(tryScroll, 100);
        return;
      }
      
      router.push('/');
      
      let attempts = 0;
      const maxAttempts = 30;
      
      const tryScroll = () => {
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = shrink ? SCROLL.MOBILE_SHRINK : SCROLL.DESKTOP_SHRINK;
          const y = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryScroll, 100);
        }
      };
      
      setTimeout(tryScroll, 200);
      return;
    }

    router.push(href);
  }, [closeMenu, router, shrink]);

  // Header classes - premium glassmorphism
  const headerClasses = useMemo(() => {
    if (menuOpen) return "fixed top-0 w-full z-[200] bg-[#0B4B50]/95 backdrop-blur-xl py-5 transition-all duration-500";
    
    if (!isHomePage) {
      return `
        fixed top-0 w-full z-[200]
        transition-all duration-500
        bg-white/98 backdrop-blur-md
        border-b border-gray-100/50
        shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)]
        ${shrink ? "py-3" : "py-5"}
      `;
    }
    
    return `
      fixed top-0 w-full z-[200]
      transition-all duration-500
      ${isScrolled
        ? "bg-white/98 backdrop-blur-md border-b border-gray-100/50 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)]" 
        : "bg-transparent"
      }
      ${shrink ? "py-3" : "py-5"}
    `;
  }, [menuOpen, isScrolled, shrink, isHomePage]);

  // Logo classes
  const logoClasses = useMemo(() => {
    if (menuOpen) return "font-playfair font-bold transition-all duration-500 text-2xl text-white";
    
    if (!isHomePage) {
      return `
        font-playfair font-bold transition-all duration-500
        ${shrink ? "text-xl" : "text-2xl"}
        bg-gradient-to-r from-[#0B4B50] to-[#0FA3A8] bg-clip-text text-transparent
      `;
    }
    
    return `
      font-playfair font-bold transition-all duration-500
      ${shrink ? "text-xl" : "text-2xl"}
      ${isScrolled 
        ? "bg-gradient-to-r from-[#0B4B50] to-[#0FA3A8] bg-clip-text text-transparent" 
        : "text-white"
      }
    `;
  }, [menuOpen, shrink, isScrolled, isHomePage]);

  // Logo span classes
  const logoSpanClasses = useMemo(() => {
    if (menuOpen) return "text-[#E8C46B]";
    if (!isHomePage) return "text-[#0FA3A8]";
    if (isScrolled) return "text-[#0FA3A8]";
    return "text-[#E8C46B]";
  }, [menuOpen, isHomePage, isScrolled]);

  // Text color
  const getTextColor = useCallback(() => {
    if (menuOpen) return "text-white/90 hover:text-white";
    if (!isHomePage) return "text-gray-700 hover:text-[#0FA3A8]";
    if (isScrolled) return "text-gray-700 hover:text-[#0FA3A8]";
    return "text-white/90 hover:text-white";
  }, [menuOpen, isScrolled, isHomePage]);

  // Active indicator style
  const isActive = (label: string) => activeIndicator === label;

  return (
    <header className={headerClasses}>
      {/* Animated gradient border bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0FA3A8]/30 to-transparent" />

      <div
        className={`
          max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10
          ${shrink && !menuOpen ? "h-[52px]" : "h-[64px]"}
          transition-all duration-500
        `}
      >
        {/* LOGO dengan efek gradient */}
        <Link
          href="/"
          onClick={(e) => {
            dispatchEvent("close-testimoni-modal");
            closeMenu();
            setActiveIndicator(null);
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          }}
          className="group relative"
        >
          <span className={logoClasses}>
            KOJE
            <span className={logoSpanClasses}>
              24
            </span>
          </span>
          {/* Hover efek underline */}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* DESKTOP MENU - PREMIUM */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => navClick(item.href, item.label)}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300
                ${getTextColor()}
                ${isActive(item.label) ? 'text-[#0FA3A8]' : ''}
                hover:bg-gray-50/10
              `}
            >
              {item.label}
              {/* Active indicator dot */}
              {isActive(item.label) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0FA3A8] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* RIGHT SECTION - PREMIUM */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={() => dispatchEvent("open-cart")}
            className="relative p-2 rounded-full hover:bg-gray-100/20 transition-all duration-300 group"
            aria-label={`Cart with ${totalQty} items`}
          >
            <ShoppingCart
              size={20}
              className={getTextColor()}
            />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg">
                {totalQty > 9 ? '9+' : totalQty}
              </span>
            )}
          </button>

          {/* CHAT DESKTOP - Premium CTA */}
          <button
            onClick={() => dispatchEvent("open-chat")}
            className={`
              hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300
              ${menuOpen
                ? "bg-white/20 text-white"
                : (isScrolled || !isHomePage)
                ? "bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
              }
            `}
          >
            <MessageCircle size={16} />
            <span>Chat</span>
          </button>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={openMenu}
            className={`md:hidden p-2 rounded-full hover:bg-gray-100/20 transition-all duration-300 ${getTextColor()}`}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU - PREMIUM SHEET */}
      {menuOpen && (
        <div
          className={`
            fixed inset-0 z-[300] flex flex-col
            bg-white/98 backdrop-blur-xl
            transition-all duration-500 ease-out
            ${menuAnimate
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-8 pointer-events-none"
            }
          `}
        >
          {/* Header Mobile Menu */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <span className="font-playfair text-2xl font-bold bg-gradient-to-r from-[#0B4B50] to-[#0FA3A8] bg-clip-text text-transparent">
              KOJE24
            </span>
            <button
              onClick={closeMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-all"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col items-start gap-2 p-6">
            {NAV_ITEMS.map((item, idx) => (
              <button
                key={item.href}
                onClick={() => navClick(item.href, item.label)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl text-lg font-medium
                  transition-all duration-300
                  ${isActive(item.label) 
                    ? 'bg-gradient-to-r from-[#0FA3A8]/10 to-[#0B4B50]/10 text-[#0FA3A8]' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animation: menuAnimate ? 'fadeInUp 0.4s ease-out forwards' : 'none',
                  opacity: 0,
                  transform: 'translateY(10px)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Button Mobile */}
          <div className="p-6 pt-0">
            <button
              onClick={() => {
                closeMenu();
                dispatchEvent("open-chat");
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle size={20} />
              Chat Sekarang
            </button>
          </div>

          {/* Footer Mobile */}
          <div className="p-6 pt-0 text-center text-xs text-gray-400">
            © 2025 <span className="text-[#0FA3A8] font-semibold">KOJE24</span>
          </div>

          {/* Animation Keyframes */}
          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </header>
  );
}
