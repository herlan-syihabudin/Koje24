"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const totalQty = useCartStore((state) => state.totalQty);

  /* ===========================
     SMART SCROLL LISTENER
  ============================ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 10);
      setShrink(y > 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ===========================
     AUTO CLOSE MENU SAAT PINDAH HALAMAN
  ============================ */
  useEffect(() => {
    // setiap pathname berubah, tutup menu HP
    setMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  const headerBaseClass =
    "fixed top-0 left-0 w-full z-40 transition-all duration-300";

  const headerStyleScrolled =
    "bg-[#020507]/85 backdrop-blur-lg shadow-md border-b border-white/5";

  const headerStyleTop = "bg-transparent";

  return (
    <header
      className={`${headerBaseClass} ${
        isScrolled ? headerStyleScrolled : headerStyleTop
      } ${shrink ? "py-2" : "py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-14 lg:px-24 flex items-center justify-between gap-4">
        {/* LOGO / BRAND */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 group"
          >
            <div className="h-9 w-9 rounded-full border border-[#0FA3A8]/50 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-[0.16em] text-[#0FA3A8] group-hover:scale-105 transition-transform">
                KJ
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm tracking-wide">
                KOJE24
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                Natural Cold-Pressed
              </span>
            </div>
          </button>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#0FA3A8] transition-colors"
          >
            Beranda
          </button>
          <button
            onClick={() => router.push("/kenapa-koje24")}
            className="hover:text-[#0FA3A8] transition-colors"
          >
            Kenapa KOJE24
          </button>
          <button
            onClick={() => router.push("/produk")}
            className="hover:text-[#0FA3A8] transition-colors"
          >
            Produk
          </button>
          <button
            onClick={() => router.push("/langganan")}
            className="hover:text-[#0FA3A8] transition-colors"
          >
            Langganan
          </button>
          <button
            onClick={() => router.push("/bantuan")}
            className="hover:text-[#0FA3A8] transition-colors"
          >
            Bantuan
          </button>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          {/* CART */}
          <button
            onClick={() => router.push("/keranjang")}
            className="relative p-2 rounded-full border border-white/10 hover:border-[#0FA3A8]/70 hover:bg-white/5 transition-colors"
            aria-label="Buka keranjang"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#0FA3A8] text-[10px] flex items-center justify-center font-semibold">
                {totalQty}
              </span>
            )}
          </button>

          {/* WHATSAPP CTA */}
          <Link
            href="https://wa.me/6281212345678?text=Halo%20KOJE24,%20saya%20ingin%20order%20juice"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-[#0FA3A8] hover:bg-[#0C8589] transition-colors shadow-md shadow-[#0FA3A8]/25"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Admin</span>
          </Link>
        </div>

        {/* MOBILE: CART + MENU BUTTON */}
        <div className="flex md:hidden items-center gap-2">
          {/* CART MOBILE */}
          <button
            onClick={() => router.push("/keranjang")}
            className="relative p-2 rounded-full border border-white/10 hover:border-[#0FA3A8]/70 hover:bg-white/5 transition-colors"
            aria-label="Buka keranjang"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#0FA3A8] text-[10px] flex items-center justify-center font-semibold">
                {totalQty}
              </span>
            )}
          </button>

          {/* MENU TOGGLER */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-full border border-white/15 hover:bg-white/5 transition-colors"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* =============== MOBILE NAV OVERLAY =============== */}
      {/* Overlay hitam transparan */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          menuOpen ? "opacity-100 pointer-events-auto bg-black/40" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Panel geser dari kanan */}
      <div
        className={`fixed top-0 right-0 h-full w-[78%] max-w-xs bg-[#020507] z-50 shadow-xl md:hidden
        transition-transform duration-250 ease-out
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/10">
          <span className="text-xs uppercase tracking-[0.24em] text-white/60">
            Menu
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-6 py-4 text-sm">
          <button
            onClick={() => handleNavClick("/")}
            className="text-left py-2 border-b border-white/5 hover:text-[#0FA3A8] transition-colors"
          >
            Beranda
          </button>
          <button
            onClick={() => handleNavClick("/kenapa-koje24")}
            className="text-left py-2 border-b border-white/5 hover:text-[#0FA3A8] transition-colors"
          >
            Kenapa KOJE24
          </button>
          <button
            onClick={() => handleNavClick("/produk")}
            className="text-left py-2 border-b border-white/5 hover:text-[#0FA3A8] transition-colors"
          >
            Produk
          </button>
          <button
            onClick={() => handleNavClick("/langganan")}
            className="text-left py-2 border-b border-white/5 hover:text-[#0FA3A8] transition-colors"
          >
            Langganan
          </button>
          <button
            onClick={() => handleNavClick("/bantuan")}
            className="text-left py-2 border-b border-white/5 hover:text-[#0FA3A8] transition-colors"
          >
            Bantuan
          </button>
        </nav>

        <div className="mt-auto px-6 pb-6 pt-2 border-t border-white/10">
          <Link
            href="https://wa.me/6281212345678?text=Halo%20KOJE24,%20saya%20ingin%20order%20juice"
            target="_blank"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium bg-[#0FA3A8] hover:bg-[#0C8589] transition-colors shadow-md shadow-[#0FA3A8]/35"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
