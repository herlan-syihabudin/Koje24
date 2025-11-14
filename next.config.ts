import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["images.unsplash.com", "webkoje-cacs.vercel.app"],
    formats: ["image/avif", "image/webp"]
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  }
};

export default nextConfig;
