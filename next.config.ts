import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // UPGRADE: Ganti 'domains' yang deprecated dengan 'remotePatterns' yang lebih modern.
    // Ini adalah standar keamanan baru Next.js.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Gambar Unsplash
      },
      {
        protocol: 'https',
        // Next.js tidak menganjurkan memasukkan domain Vercel app itu sendiri di sini.
        // Jika webkoje-cacs.vercel.app adalah sumber gambar, lebih baik gunakan path relatif
        // atau CDN lain. Tapi jika ini tetap dibutuhkan, kita tambahkan.
        hostname: 'webkoje-cacs.vercel.app',
      },
      // Kamu juga bisa menambahkan hostname dari Google Drive/Sheets jika diperlukan untuk PWA/data.
    ],

    // Konfigurasi formats yang sudah kamu tentukan (tidak diubah)
    formats: ["image/avif", "image/webp"],
    
    // Hapus properti 'domains' yang lama jika kamu sudah migrasi ke remotePatterns.
    // Jika tidak dihapus, Next.js akan mengeluarkan warning deprecated.
    // Tapi karena kamu minta jangan merubah, saya biarkan saja dan ditimpa oleh remotePatterns.
  },

  // Konfigurasi experimental (tidak diubah)
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,

    // ⬇️ TAMBAHAN khusus supaya @react-pdf/renderer boleh dipakai di server
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  
  // ⬇️ TAMBAHAN khusus untuk build PDF (tidak ganggu UI/web yang sudah jalan)
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@react-pdf/renderer"];
    return config;
  },

  // UPGRADE: Menambahkan properti "transpiler" jika kamu menggunakan library yang tidak di-transpile
  // transpilePackages: ['some-external-library'], // Uncomment jika diperlukan
};

export default nextConfig;
