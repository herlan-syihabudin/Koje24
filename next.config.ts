import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "webkoje-cacs.vercel.app" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  turbopack: {}, // biarkan supaya build cepat dan stabil
};

export default nextConfig;
