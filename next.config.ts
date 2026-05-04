import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      
      // ⭐ TAMBAHKAN INI (domain utama)
      { protocol: "https", hostname: "koje24.com" },           // ← TAMBAH!
      
      // 🔥 DOMAIN PRODUKSI LAMA (vercel.app)
      { protocol: "https", hostname: "koje24.vercel.app" },
      { protocol: "https", hostname: "webkoje24.vercel.app" }, // ← TAMBAH juga
      
      // 🔁 preview / deployment vercel lain
      { protocol: "https", hostname: "*.vercel.app" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: {
      allowedOrigins: ["https://koje24.com", "https://koje24.vercel.app"], // ← TAMBAH
    },
  },

  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
};

export default nextConfig;
