"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronRight,
  X,
  Sparkles,
  Clock,
  ThumbsUp,
  BookOpen,
  Truck,
  Package,
  CreditCard,
  Shield,
  HelpCircle
} from "lucide-react";
import ChatWindow from "./ChatWindow";
import FaqSection from "./FaqSection";

// Types
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  url: string;
}

// Constants
const CATEGORIES: Category[] = [
  { id: "all", name: "Semua", icon: <BookOpen size={16} />, color: "#0FA3A8" },
  { id: "produk", name: "Produk", icon: <Package size={16} />, color: "#0FA3A8" },
  { id: "pengiriman", name: "Pengiriman", icon: <Truck size={16} />, color: "#E8C46B" },
  { id: "pembayaran", name: "Pembayaran", icon: <CreditCard size={16} />, color: "#0B4B50" },
  { id: "keamanan", name: "Keamanan", icon: <Shield size={16} />, color: "#0FA3A8" },
  { id: "lainnya", name: "Lainnya", icon: <HelpCircle size={16} />, color: "#6B7280" },
];

const POPULAR_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Cara menyimpan jus KOJE24 agar tahan lama",
    category: "produk",
    views: 1243,
    helpful: 45,
    url: "/bantuan/penyimpanan-jus"
  },
  {
    id: "2",
    title: "Apakah KOJE24 aman untuk ibu hamil?",
    category: "keamanan",
    views: 987,
    helpful: 32,
    url: "/bantuan/keamanan-ibu-hamil"
  },
  {
    id: "3",
    title: "Berapa lama pengiriman ke luar kota?",
    category: "pengiriman",
    views: 876,
    helpful: 28,
    url: "/bantuan/pengiriman-luar-kota"
  },
  {
    id: "4",
    title: "Cara berhenti langganan paket rutin",
    category: "produk",
    views: 654,
    helpful: 21,
    url: "/bantuan/berhenti-langganan"
  }
];

const QUICK_ACTIONS = [
  { icon: <MessageCircle size={18} />, label: "Live Chat", action: "chat" },
  { icon: <Mail size={18} />, label: "Email Support", action: "email" },
  { icon: <Phone size={18} />, label: "Call Center", action: "phone" },
];

export default function HelpCenter() {
  const [openChat, setOpenChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("koje24_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch {}
    }
  }, []);

  // Save search to recent
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("koje24_recent_searches", JSON.stringify(updated));
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    saveSearch(searchQuery);
    setShowSearchResults(true);
    // Track search for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag?.('event', 'search', {
        search_term: searchQuery
      });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Handle quick action
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "chat":
        setOpenChat(true);
        break;
      case "email":
        window.location.href = "mailto:info@koje24.id";
        break;
      case "phone":
        window.location.href = "tel:+622213139580";
        break;
    }
  };

  // Handle helpful feedback
  const handleHelpful = (articleId: string, isHelpful: boolean) => {
    setHelpfulFeedback(prev => ({ ...prev, [articleId]: isHelpful }));
    
    // Track feedback
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag?.('event', 'article_helpful', {
        article_id: articleId,
        helpful: isHelpful
      });
    }
  };

  // Filter articles based on category
  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return POPULAR_ARTICLES;
    return POPULAR_ARTICLES.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fcfc] via-white to-[#f0f6f6] pt-28 pb-20">
      {/* Schema Markup untuk SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": POPULAR_ARTICLES.map(a => ({
              "@type": "Question",
              "name": a.title,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Lihat artikel tentang ${a.title} di website kami`
              }
            }))
          })
        }}
      />

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 lg:px-0 mb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <a href="/" className="hover:text-[#0FA3A8]">Beranda</a>
          <ChevronRight size={12} />
          <span className="text-[#0FA3A8] font-medium">Pusat Bantuan</span>
        </nav>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0FA3A8] bg-[#e3f6f6] px-3 py-1 rounded-full mb-4">
          <Sparkles size={14} />
          Pusat Bantuan KOJE24
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jawaban... Misal: 'cara order', 'penyimpanan', 'manfaat'"
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-[#e4f2f2] bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/30 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !showSearchResults && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span>Pencarian terakhir:</span>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(search);
                    setShowSearchResults(true);
                  }}
                  className="px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-[1.6fr,1.1fr] gap-8 items-start">
          {/* Left Column */}
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-[2.7rem] leading-tight text-[#061215] mb-4">
              Ada pertanyaan tentang{" "}
              <span className="text-[#0FA3A8]">KOJE24</span>?
            </h1>
            <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed mb-6">
              Di sini kamu bisa menemukan jawaban seputar varian jus, manfaat,
              cara pemesanan, pengiriman, hingga cara penyimpanan yang benar.
              Kalau masih bingung, kamu bisa ngobrol langsung dengan{" "}
              <span className="font-semibold">KOJE24 Assistant</span>.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={() => handleQuickAction("chat")}
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0FA3A8] to-[#0b6f74] shadow-lg shadow-[#0FA3A8]/25 hover:shadow-xl hover:brightness-110 transition-all"
              >
                Buka KOJE24 Assistant
              </button>
              
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.label.toLowerCase().replace(' ', ''))}
                  className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-[#0FA3A8] hover:text-white transition-all"
                  title={action.label}
                >
                  {action.icon}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              🟢 Online • jawab dalam hitungan detik
            </p>
          </div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-[#e4f2f2] shadow-[0_18px_45px_rgba(9,34,40,0.08)] p-5 md:p-6 flex flex-col gap-4"
          >
            <div>
              <p className="text-xs font-semibold text-[#0FA3A8] mb-1">
                🔥 Paling sering dicari
              </p>
              <h2 className="text-base font-semibold text-[#062126] mb-2">
                Artikel populer minggu ini
              </h2>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#0FA3A8] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Popular Articles */}
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <a
                    href={article.url}
                    className="block rounded-2xl border border-[#e5f2f2] bg-[#f7fcfc] px-4 py-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-slate-700 flex-1">
                        {article.title}
                      </span>
                      <ChevronRight size={16} className="text-[#0FA3A8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        👁️ {article.views.toLocaleString()} views
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleHelpful(article.id, !helpfulFeedback[article.id]);
                        }}
                        className={`flex items-center gap-1 hover:text-[#0FA3A8] transition ${
                          helpfulFeedback[article.id] ? 'text-[#0FA3A8]' : ''
                        }`}
                      >
                        <ThumbsUp size={12} />
                        {article.helpful}
                      </button>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* View All Link */}
            <a
              href="/bantuan/artikel"
              className="text-xs text-[#0FA3A8] font-medium hover:underline text-center mt-2"
            >
              Lihat semua artikel →
            </a>
          </motion.div>
        </div>
      </section>

      {/* SEARCH RESULTS MODAL */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchResults(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  Hasil pencarian: "{searchQuery}"
                </h3>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Ini nanti diisi dengan hasil pencarian dari API */}
                <p className="text-gray-500 text-center py-8">
                  Fitur pencarian akan segera hadir! 🚀
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ SECTION */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 lg:px-0">
        <FaqSection />

        {/* Helpful Feedback */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Apakah informasi di halaman ini membantu?
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                // Track feedback
                if (typeof window !== 'undefined' && 'gtag' in window) {
                  (window as any).gtag?.('event', 'helpful_page', {
                    helpful: true
                  });
                }
              }}
              className="px-6 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
            >
              👍 Ya
            </button>
            <button
              onClick={() => setOpenChat(true)}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
            >
              👎 Tidak, chat saja
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Masih belum ketemu jawabannya?{" "}
          <button
            onClick={() => setOpenChat(true)}
            className="inline-flex items-center gap-1 font-semibold text-[#0FA3A8] hover:text-[#0b7f84] underline-offset-4 hover:underline"
          >
            Buka KOJE24 Assistant
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {openChat && (
          <ChatWindow onClose={() => setOpenChat(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}