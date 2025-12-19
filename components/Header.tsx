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

  // 🔥 CHAT STATE
  const [openChat, setOpenChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [sending, setSending] = useState(false);

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  /* ===========================
     SESSION ID (STABLE)
  ============================ */
  const getSessionId = () => {
    if (typeof window === "undefined") return "";
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", sid);
    }
    return sid;
  };

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
     BODY LOCK FIX
  ============================ */
  const lockBody = () => document.body.classList.add("body-menu-lock");
  const unlockBody = () => document.body.classList.remove("body-menu-lock");

  const openMenu = () => {
    setMenuOpen(true);
    requestAnimationFrame(() => setMenuAnimate(true));
    window.scrollTo({ top: 0 });
    lockBody();
  };

  const closeMenu = () => {
    setMenuAnimate(false);
    unlockBody();
    setTimeout(() => setMenuOpen(false), 180);
  };

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

  /* ===========================
     SEND CHAT → TELEGRAM
  ============================ */
  const sendChat = async () => {
    if (!chatMessage.trim() || sending) return;

    setSending(true);
    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Guest",
          message: chatMessage,
          sessionId: getSessionId(),
          page: window.location.pathname,
        }),
      });

      setChatMessage("");
      alert("Pesan terkirim. Admin akan membalas 💬");
    } catch (e) {
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

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
          transition-all duration-700`}
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
            className={`font-playfair font-bold transition-all duration-700 ${
              shrink && !menuOpen ? "text-xl" : "text-2xl"
            } ${
              menuOpen
                ? "text-white"
                : isScrolled
                ? "text-[#0B4B50]"
                : "text-white"
            }`}
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
                className={`font-medium transition-all duration-300 ${
                  menuOpen
                    ? "text-white"
                    : isScrolled
                    ? "text-[#0B4B50] hover:text-[#0FA3A8]"
                    : "text-white hover:text-[#E8C46B]"
                }`}
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

            {/* CHAT BUTTON */}
            <button
              onClick={() => setOpenChat(true)}
              className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-md transition-all ${
                menuOpen
                  ? "bg-white/20 text-white"
                  : isScrolled
                  ? "bg-[#0FA3A8] text-white hover:bg-[#0B4B50]"
                  : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
              }`}
            >
              <MessageCircle size={20} /> Chat
            </button>
          </nav>

          {/* MOBILE ICON */}
          <button
            onClick={openMenu}
            className={`md:hidden text-2xl ${
              menuOpen
                ? "text-white"
                : isScrolled
                ? "text-[#0B4B50]"
                : "text-white"
            }`}
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* ===========================
          CHAT MODAL (AKTIF)
      ============================ */}
      {openChat && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full md:w-[420px] bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-[#0B4B50]">
                Chat Admin KOJE24
              </h3>
              <button onClick={() => setOpenChat(false)}>✕</button>
            </div>

            <div className="h-[220px] bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-sm text-gray-400">
              Admin akan membalas melalui chat ini
            </div>

            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Tulis pertanyaan kamu..."
              disabled={sending}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
            />

            <button
              onClick={sendChat}
              disabled={sending}
              className="mt-2 w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm hover:bg-[#0B4B50] transition disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
