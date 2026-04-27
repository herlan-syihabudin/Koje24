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
  HelpCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Star
} from "lucide-react";
import ChatWindow from "./ChatWindow";
import FaqSection from "./FaqSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Types & Constants (sama seperti sebelumnya)
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
  { icon: <MessageCircle size={18} />, label: "Live Chat", action: "chat", gradient: "from-[#0FA3A8] to-[#0B4B50]" },
  { icon: <Mail size={18} />, label: "Email", action: "email", gradient: "from-blue-500 to-blue-600" },
  { icon: <Phone size={18} />, label: "Call", action: "phone", gradient: "from-green-500 to-green-600" },
];

export default function HelpCenter() {
  const [openChat, setOpenChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("koje24_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch {}
    }
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("koje24_recent_searches", JSON.stringify(updated));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    saveSearch(searchQuery);
    setShowSearchResults(true);
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag?.('event', 'search', { search_term: searchQuery });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

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

  const handleHelpful = (articleId: string, isHelpful: boolean) => {
    setHelpfulFeedback(prev => ({ ...prev, [articleId]: isHelpful }));
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag?.('event', 'article_helpful', { article_id: articleId, helpful: isHelpful });
    }
  };

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return POPULAR_ARTICLES;
    return POPULAR_ARTICLES.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 pb-24">
        
        {/* HERO SECTION - UPGRADED */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0FA3A8]/5 via-transparent to-transparent" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-[#0FA3A8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E8C46B]/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-20 pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <a href="/" className="text-gray-500 hover:text-[#0FA3A8] transition">Beranda</a>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-[#0FA3A8] font-semibold">Pusat Bantuan</span>
            </nav>

            {/* Header */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0FA3A8]/10 to-[#0FA3A8]/5 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#0FA3A8]/20">
              <Sparkles size={16} className="text-[#0FA3A8]" />
              <span className="text-sm font-medium text-[#0FA3A8]">24/7 Customer Support</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4">
              Ada pertanyaan tentang
              <span className="bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] bg-clip-text text-transparent"> KOJE24</span>?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
              Temukan jawaban cepat seputar produk, pemesanan, pengiriman, dan lainnya. 
              Butuh bantuan instan? Chat dengan KOJE24 Assistant sekarang.
            </p>

            {/* Search Bar - UPGRADED */}
            <div className="max-w-2xl">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0FA3A8]/20 to-[#E8C46B]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Search className="absolute left-5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jawaban... (misal: 'cara order', 'penyimpanan')"
                    className="w-full pl-12 pr-24 py-4 bg-transparent rounded-2xl outline-none text-gray-700 placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    Cari
                  </button>
                </div>
              </form>

              {/* Recent Searches */}
              {recentSearches.length > 0 && !showSearchResults && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                  <Clock size={14} className="text-gray-400" />
                  <span>Pencarian terakhir:</span>
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(search);
                        setShowSearchResults(true);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions - UPGRADED */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => handleQuickAction("chat")}
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <MessageCircle size={18} />
                Buka KOJE24 Assistant
                <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </button>
              
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.action)}
                  className="p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-[#0FA3A8] hover:text-[#0FA3A8] hover:shadow-md transition-all duration-300"
                  title={action.label}
                >
                  {action.icon}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mt-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-500">Online • Respon rata-rata &lt; 2 menit</span>
            </div>
          </div>
        </section>

        {/* Main Content Grid - UPGRADED */}
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8">
            
            {/* Left Column - Featured Articles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Artikel Populer</h2>
                  <p className="text-gray-500 text-sm mt-1">Yang paling sering dibaca minggu ini</p>
                </div>
                <TrendingUp size={20} className="text-[#0FA3A8]" />
              </div>

              {/* Category Filters - UPGRADED */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? "bg-[#0FA3A8] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Articles Grid */}
              <div className="space-y-3">
                {filteredArticles.map((article, idx) => (
                  <motion.a
                    key={article.id}
                    href={article.url}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group block bg-white rounded-xl border border-gray-100 p-4 hover:border-[#0FA3A8]/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-[#0FA3A8] transition mb-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            👁️ {article.views.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleHelpful(article.id, !helpfulFeedback[article.id]);
                            }}
                            className={`flex items-center gap-1 transition ${
                              helpfulFeedback[article.id] ? 'text-[#0FA3A8]' : 'hover:text-[#0FA3A8]'
                            }`}
                          >
                            <ThumbsUp size={12} />
                            {article.helpful}
                          </button>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#0FA3A8] group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* View All */}
              <a
                href="/bantuan/artikel"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[#0FA3A8] hover:gap-3 transition-all"
              >
                Lihat semua artikel
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Right Column - FAQ & Support */}
            <div className="space-y-6">
              {/* FAQ Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} className="text-[#E8C46B] fill-[#E8C46B]" />
                  <h2 className="text-xl font-bold text-gray-900">Pertanyaan Umum</h2>
                </div>
                <FaqSection />
              </div>

              {/* Need More Help Card */}
              <div className="bg-gradient-to-br from-[#0FA3A8]/5 to-[#0B4B50]/5 rounded-2xl p-6 border border-[#0FA3A8]/10 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Masih butuh bantuan?</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Tim support kami siap membantu 24/7 via chat
                </p>
                <button
                  onClick={() => setOpenChat(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:border-[#0FA3A8] hover:text-[#0FA3A8] transition-all"
                >
                  <Zap size={16} />
                  Chat Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Feedback Bar */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Apakah informasi di halaman ini membantu?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && 'gtag' in window) {
                    (window as any).gtag?.('event', 'helpful_page', { helpful: true });
                  }
                }}
                className="px-5 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium hover:bg-green-100 transition"
              >
                👍 Ya, membantu
              </button>
              <button
                onClick={() => setOpenChat(true)}
                className="px-5 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition"
              >
                👎 Tidak, chat saja
              </button>
            </div>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <AnimatePresence>
          {openChat && (
            <ChatWindow onClose={() => setOpenChat(false)} />
          )}
        </AnimatePresence>
      </main>
      <Footer />

      {/* SEARCH RESULTS MODAL */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchResults(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Hasil pencarian: "{searchQuery}"</h3>
                <button onClick={() => setShowSearchResults(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                <p className="text-gray-400 text-center py-8">
                  Fitur pencarian akan segera hadir! 🚀
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
