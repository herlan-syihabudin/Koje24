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

  // CHAT
  const [openChat, setOpenChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [sending, setSending] = useState(false);

  const router = useRouter();
  const totalQty = useCartStore((state) => state.totalQty);

  const getSessionId = () => {
    if (typeof window === "undefined") return "";
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", sid);
    }
    return sid;
  };

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

  const lockBody = () => document.body.classList.add("body-menu-lock");
  const unlockBody = () => document.body.classList.remove("body-menu-lock");

  // 🔥 FIX UTAMA ADA DI SINI
  const openMenu = () => {
    setOpenChat(false); // WAJIB
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
    } catch {
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-[200]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 h-[82px]">
          <Link href="/" className="text-2xl font-bold">
            KOJE<span className="text-[#0FA3A8]">24</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button key={item.href} onClick={() => navClick(item.href)}>
                {item.label}
              </button>
            ))}
            <button onClick={() => setOpenChat(true)}>
              <MessageCircle size={20} /> Chat
            </button>
          </nav>

          {/* 🔥 MOBILE BUTTON FIX */}
          <button
            type="button"
            onClick={openMenu}
            className="md:hidden"
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* CHAT MODAL */}
      {openChat ? (
        <div className="fixed inset-0 z-[500] bg-black/40 flex items-end justify-center">
          <div className="w-full md:w-[420px] bg-white p-5 rounded-t-2xl">
            <button onClick={() => setOpenChat(false)}>✕</button>
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Tulis pesan..."
              className="w-full border p-2"
            />
            <button onClick={sendChat}>Kirim</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
