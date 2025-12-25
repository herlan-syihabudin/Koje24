import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },

      // 🔥 DOMAIN PRODUKSI UTAMA
      { protocol: "https", hostname: "koje24.vercel.app" },

      // 🔁 preview / deployment vercel lain
      { protocol: "https", hostname: "*.vercel.app" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: {
      // 🔥 HARUS DOMAIN PRODUKSI
      allowedOrigins: ["https://koje24.vercel.app"],
    },
  },

  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
};

export default nextConfig;
