import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'webkoje-cacs.vercel.app' },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // ⬇️ FIX PDF agar build Vercel jalan pada Next.js 16 + Turbopack
  serverExternalPackages: ["@react-pdf/renderer"],
  turbopack: {},
};

export default nextConfig;
