import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "webkoje-cacs.vercel.app" }, // old
      { protocol: "https", hostname: "webkoje24.vercel.app" }, // production
      { protocol: "https", hostname: "*.vercel.app" }, // preview builds
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: {
      allowedOrigins: ["https://webkoje24.vercel.app"],
    },
  },

  // Recommended for Next.js 16 patch
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
};

export default nextConfig;
