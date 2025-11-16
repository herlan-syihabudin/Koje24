/** @type {import('tailwindcss').Config} */
module.exports = {
  // UPGRADE 1: CONTENT ARRAY
  // Menggunakan syntax glob standar Next.js untuk App Router (lebih ringkas)
  content: [
    "./{app,pages,components}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // UPGRADE 2: Menambahkan Breakpoint Ekstra (jika dibutuhkan untuk tablet besar)
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1700px', // Tambahan screen besar
    },
    extend: {
      // FONT FAMILY SUDAH BAGUS (TIDAK DIUBAH)
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
      // COLORS SUDAH BAGUS (Hanya penamaan yang saya samakan dengan rekomendasi sebelumnya agar konsisten)
      colors: {
        'koje-brand': "#0FA3A8", // Sebelumnya 'brand'
        'koje-dark': "#0B4B50",  // Sebelumnya 'brand-dark'
        'koje-accent': "#E8C46B", // Sebelumnya 'accent'
      },
      // BOX SHADOW SUDAH BAGUS (TIDAK DIUBAH)
      boxShadow: {
        soft: "0 5px 25px rgba(0,0,0,0.04)",
        strong: "0 10px 35px rgba(15,163,168,0.15)",
      },

      // UPGRADE 3: Menambahkan Keyframes dan Animation (Untuk animasi non-Framer Motion)
      keyframes: {
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      animation: {
        // Digunakan: animate-fadeInUp (cepat, smooth load)
        'fadeInUp': 'fadeInUp 0.5s ease-out forwards',
        // Digunakan: animate-ping-slow (untuk notifikasi/badge)
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
