/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
      colors: {
        brand: "#0FA3A8",
        "brand-dark": "#0B4B50",
        accent: "#E8C46B",
      },
      boxShadow: {
        soft: "0 5px 25px rgba(0,0,0,0.04)",
        strong: "0 10px 35px rgba(15,163,168,0.15)",
      },
    },
  },
  plugins: [],
}
