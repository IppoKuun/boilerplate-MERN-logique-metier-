/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#ecfdf3",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#22c55e", // logo green
          700: "#16a34a",
          800: "#15803d",
          900: "#166534",
        },
      },
      keyframes: {
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%,100%": {
            opacity: 0.5,
            filter: "drop-shadow(0 0 0px rgba(34,197,94,0))",
          },
          "50%": {
            opacity: 1,
            filter: "drop-shadow(0 0 12px rgba(34,197,94,0.35))",
          },
        },
      },
      animation: {
        progress: "progress 1.4s ease-in-out infinite",
        glow: "glow 1.6s ease-in-out infinite",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(2,6,23,0.12)",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1200px" },
      },
    },
  },
  plugins: [],
};
