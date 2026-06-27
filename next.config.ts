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
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 tahun
  },

  // ❌ HAPUS swcMinify (sudah default di Next.js 16)
  // swcMinify: true,

  compiler: {
    // ✅ HAPUS CONSOLE DI PRODUCTION
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // ✅ optimizePackageImports sudah ada di Next.js 16
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
