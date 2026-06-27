import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "koje24.com" },
      { protocol: "https", hostname: "koje24.vercel.app" },
      { protocol: "https", hostname: "webkoje24.vercel.app" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // ✅ TAMBAHKAN: Cache gambar lebih lama
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 tahun
  },

  // ✅ TAMBAHKAN: Optimasi SWC dan bundle
  swcMinify: true,
  
  compiler: {
    // ✅ HAPUS CONSOLE DI PRODUCTION (opsional)
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"], // Tetap tampilkan error & warning
    } : false,
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // ✅ TAMBAHKAN: Optimasi bundle
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      allowedOrigins: [
        "https://koje24.com",
        "https://koje24.vercel.app",
        "https://*.vercel.app",
        "https://koje24-git-*.vercel.app",
        "https://koje24-*.vercel.app",
      ],
    },
  },

  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ✅ TAMBAHKAN: Cache untuk gambar
      {
        source: "/image/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/product/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ✅ TAMBAHKAN: Security headers
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/#produk",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
