/** @type {import('tailwindcss').Config} */
module.exports = {
  // UPGRADE 1: CONTENT ARRAY
  content: [
    "./{app,pages,components}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // UPGRADE 2: Menambahkan Breakpoint Ekstra
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1700px', 
    },
    extend: {
      // FONT FAMILY menggunakan CSS Variable dari next/font
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
      // COLORS sudah disamakan
      colors: {
        'koje-brand': "#0FA3A8",
        'koje-dark': "#0B4B50",
        'koje-accent': "#E8C46B",
      },
      // BOX SHADOW sudah bagus
      boxShadow: {
        soft: "0 5px 25px rgba(0,0,0,0.04)",
        strong: "0 10px 35px rgba(15,163,168,0.15)",
      },

      // Keyframes dan Animation sudah bagus
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
        'fadeInUp': 'fadeInUp 0.5s ease-out forwards',
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
