import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["images.unsplash.com", "webkoje-cacs.vercel.app"],
    formats: ["image/avif", "image/webp"]
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  },
};

export default pwa(nextConfig);
