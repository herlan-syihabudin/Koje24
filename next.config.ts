import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Domain gambar yang diizinkan (bisa tambahin kalau ada CDN lain)
    domains: ["images.unsplash.com", "webkoje-cacs.vercel.app"],
    formats: ["image/avif", "image/webp"],
  },
  // 🔹 Nonaktifkan cache build untuk API data real-time (opsional)
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
}

export default nextConfig
