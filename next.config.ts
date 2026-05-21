import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      
      // Domain utama
      { protocol: "https", hostname: "koje24.com" },
      { protocol: "https", hostname: "koje24.vercel.app" },
      { protocol: "https", hostname: "webkoje24.vercel.app" },
      
      // 🔥 TAMBAHKAN INI! - VERCEL BLOB STORAGE
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      
      // Preview deployment lain
      { protocol: "https", hostname: "*.vercel.app" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: {
      allowedOrigins: [
        "https://koje24.com", 
        "https://koje24.vercel.app",
        "https://*.vercel.app"
      ],
    },
  },

  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
};

export default nextConfig;
