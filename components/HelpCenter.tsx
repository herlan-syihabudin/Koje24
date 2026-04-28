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
  Star,
  Globe,
  Headphones,
  Award,
  Coffee,
  Leaf
} from "lucide-react";
import ChatWindow from "./ChatWindow";

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
    url: "/pusat-bantuan/penyimpanan-jus"
  },
  {
    id: "2",
    title: "Apakah KOJE24 aman untuk ibu hamil?",
    category: "keamanan",
    views: 987,
    helpful: 32,
    url: "/pusat-bantuan/keamanan-ibu-hamil"
  },
  {
    id: "3",
    title: "Berapa lama pengiriman ke luar kota?",
    category: "pengiriman",
    views: 876,
    helpful: 28,
    url: "/pusat-bantuan/pengiriman-luar-kota"
  },
  {
    id: "4",
    title: "Cara berhenti langganan paket rutin",
    category: "produk",
    views: 654,
    helpful: 21,
    url: "/pusat-bantuan/berhenti-langganan"
  }
];

const QUICK_ACTIONS = [
  { icon: <MessageCircle size={18} />, label: "Live Chat", action: "chat", desc: "Respon < 2 menit" },
  { icon: <Mail size={18} />, label: "Email", action: "email", desc: "info@koje24.id" },
  { icon: <Phone size={18} />, label: "Call", action: "phone", desc: "022-13139580" },
];

// FAQ Item Component with animation
function FaqItem({ question, answer, category, index }: { question: string; answer: string; category: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-100 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 text-left flex items-start justify-between gap-4 group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-[#0FA3A8] bg-[#0FA3A8]/10 px-2.5 py-0.5 rounded-full">
              {category}
            </span>
          </div>
          <span className="text-base font-semibold text-gray-800 group-hover:text-[#0FA3A8] transition">
            {question}
          </span>
        </div>
        <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#0FA3A8]' : 'group-hover:bg-gray-200'}`}>
          <ChevronRight 
            size={14} 
            className={`text-gray-500 transition-all duration-300 ${isOpen ? 'rotate-90 text-white' : 'group-hover:text-[#0FA3A8]'}`}
          />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-gray-600 leading-relaxed pl-0">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Stats Card Component
function StatCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="text-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center mx-auto mb-3`}>
        <Icon size={20} className={`text-${color}-500`} />
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </motion.div>
  );
}

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
      <main className="min-h-screen bg-white">
        
        {/* HERO SECTION - PREMIUM GLASSMORPHISM */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0FA3A8]/5 via-white to-[#E8C46B]/5">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-[#0FA3A8]/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-[#E8C46B]/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#0B4B50]/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
          </div>
          
          <div className="relative max-w-6xl mx-auto px-6 md:px-10 pb-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8">
              <a href="/" className="text-gray-500 hover:text-[#0FA3A8] transition">Beranda</a>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-[#0FA3A8] font-semibold">Pusat Bantuan</span>
            </nav>

            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-200 shadow-sm"
            >
              <Sparkles size={16} className="text-[#0FA3A8]" />
              <span className="text-sm font-medium text-gray-700">✨ 24/7 Premium Support</span>
            </motion.div>

            {/* Title - BIG & BOLD */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-gray-900">Ada yang bisa</span>
              <br />
              <span className="bg-gradient-to-r from-[#0FA3A8] via-[#0B4B50] to-[#E8C46B] bg-clip-text text-transparent">
                kami bantu?
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed"
            >
              Temukan jawaban cepat seputar produk, pemesanan, pengiriman, dan lainnya. 
              Butuh bantuan instan? Chat dengan KOJE24 Assistant sekarang.
            </motion.p>

            {/* Search Bar - ULTRA PREMIUM */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                <div className="relative flex items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Search className="absolute left-5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jawaban... (misal: 'cara order', 'penyimpanan')"
                    className="w-full pl-12 pr-28 py-4.5 bg-transparent rounded-2xl outline-none text-gray-700 placeholder:text-gray-400 text-base"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Cari Jawaban
                  </button>
                </div>
              </form>

              {/* Recent Searches */}
              {recentSearches.length > 0 && !showSearchResults && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                  <Clock size={14} className="text-gray-400" />
                  <span>Riwayat pencarian:</span>
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(search);
                        setShowSearchResults(true);
                      }}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-full text-xs transition border border-gray-200"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mt-10"
            >
              <StatCard icon={Headphones} value="24/7" label="Support Aktif" color="green" />
              <StatCard icon={Clock} value="< 2m" label="Respon Cepat" color="blue" />
              <StatCard icon={Award} value="98%" label="Puas" color="yellow" />
              <StatCard icon={Globe} value="100+" label="Artikel" color="purple" />
            </motion.div>

            {/* Quick Actions - Premium Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3 mt-10"
            >
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.action)}
                  className="group flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:border-[#0FA3A8] hover:shadow-md transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-[#0FA3A8]/10 flex items-center justify-center transition">
                    <div className="text-gray-500 group-hover:text-[#0FA3A8]">
                      {action.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-700 group-hover:text-[#0FA3A8]">
                      {action.label}
                    </div>
                    <div className="text-xs text-gray-400">{action.desc}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* MAIN CONTENT - PREMIUM LAYOUT */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="space-y-16">
            
            {/* POPULAR ARTICLES SECTION */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={20} className="text-[#0FA3A8]" />
                    <span className="text-sm font-semibold text-[#0FA3A8] uppercase tracking-wide">Most Popular</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Artikel Populer</h2>
                  <p className="text-gray-500 mt-1">Yang paling sering dibaca minggu ini</p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? "bg-[#0FA3A8] text-white shadow-md"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Articles Grid - 2 Column Premium Cards */}
              <div className="grid md:grid-cols-2 gap-5">
                {filteredArticles.map((article, idx) => (
                  <motion.a
                    key={article.id}
                    href={article.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#0FA3A8]/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#0FA3A8]/5 to-transparent rounded-bl-3xl" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-[#0FA3A8] transition mb-2 line-clamp-2">
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
                      <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[#0FA3A8]/10 flex items-center justify-center transition">
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[#0FA3A8] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* View All Link */}
              <motion.a
                href="/pusat-bantuan/artikel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[#0FA3A8] hover:gap-3 transition-all"
              >
                Lihat semua artikel
                <ArrowRight size={14} />
              </motion.a>
            </div>

            {/* FAQ SECTION - PREMIUM ACCORDION */}
            <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-[#0FA3A8]/10 px-4 py-2 rounded-full mb-4">
                  <Star size={16} className="text-[#0FA3A8] fill-[#0FA3A8]/20" />
                  <span className="text-sm font-medium text-[#0FA3A8]">Frequently Asked Questions</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Yang Sering Ditanyakan
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Temukan jawaban seputar <span className="font-semibold text-[#0FA3A8]">KOJE24</span> — mulai dari penyimpanan, manfaat, hingga cara pemesanan
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-[#0FA3A8] to-[#E8C46B] rounded-full mx-auto mt-4" />
              </div>
              
              <div className="max-w-3xl mx-auto divide-y divide-gray-100">
                <FaqItem 
                  question="Apa itu KOJE24?"
                  answer="KOJE24 adalah minuman sehat cold-pressed alami tanpa gula tambahan dan tanpa pengawet. Dibalut dari bahan segar pilihan setiap hari untuk menjaga keseimbangan tubuh, energi, dan kesehatan kulit."
                  category="Produk"
                  index={0}
                />
                <FaqItem 
                  question="Berapa lama masa simpan jus KOJE24?"
                  answer="Dalam kondisi tertutup rapat dan disimpan di chiller 0-4°C, jus KOJE24 idealnya dikonsumsi dalam 2-3 hari untuk mendapatkan manfaat dan kesegaran maksimal."
                  category="Produk"
                  index={1}
                />
                <FaqItem 
                  question="Bagaimana cara memesan KOJE24?"
                  answer="Pilih varian jus favoritmu → masukkan ke keranjang → isi alamat pengiriman → lakukan pembayaran → pesanan akan segera diproses dan dikirim."
                  category="Pesanan"
                  index={2}
                />
                <FaqItem 
                  question="Apakah KOJE24 bisa untuk diet?"
                  answer="Sangat cocok! Jus KOJE24 rendah kalori, tanpa gula tambahan, dan kaya serat. Sangat baik untuk program detoks dan menjaga berat badan ideal."
                  category="Produk"
                  index={3}
                />
                <FaqItem 
                  question="Berapa minimum pemesanan?"
                  answer="Untuk area Surabaya tidak ada minimum pemesanan. Untuk luar Surabaya, minimum pemesanan 2 botol."
                  category="Pengiriman"
                  index={4}
                />
                <FaqItem 
                  question="Apakah ada garansi jika produk rusak?"
                  answer="Ada! Kami memberikan garansi 100% jika produk rusak atau tidak sesuai. Segera hubungi CS kami maksimal 1x24 jam setelah barang diterima."
                  category="Kebijakan"
                  index={5}
                />
              </div>
            </div>

            {/* CTA BANNER - PREMIUM */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0FA3A8] to-[#0B4B50] rounded-3xl p-10 text-center shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Headphones size={16} className="text-white" />
                  <span className="text-sm font-medium text-white">We're here 24/7</span>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3">
                  Masih butuh bantuan?
                </h3>
                <p className="text-white/80 mb-6 max-w-md mx-auto">
                  Tim support kami siap membantu Anda kapan saja. Chat sekarang untuk solusi cepat!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setOpenChat(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-[#0FA3A8] font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <MessageCircle size={18} />
                    Chat Sekarang
                  </button>
                  <a
                    href="https://wa.me/6282213139580"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* FEEDBACK SECTION */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                <Coffee size={14} className="text-gray-500" />
                <span className="text-xs text-gray-500">Help us improve</span>
              </div>
              <p className="text-gray-600 mt-4 mb-3">Apakah informasi di halaman ini membantu?</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'gtag' in window) {
                      (window as any).gtag?.('event', 'helpful_page', { helpful: true });
                    }
                  }}
                  className="px-6 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium hover:bg-green-100 transition"
                >
                  👍 Ya, membantu
                </button>
                <button
                  onClick={() => setOpenChat(true)}
                  className="px-6 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition"
                >
                  👎 Tidak, chat saja
                </button>
              </div>
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

      {/* SEARCH RESULTS MODAL */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
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
                <div className="text-center py-12">
                  <Leaf size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">Fitur pencarian akan segera hadir! 🚀</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
