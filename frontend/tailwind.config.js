// tailwind.config.js
module.exports = {
  content: ["./src/app/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        progress: {
          "0%":   { transform: "translateX(-100%)" },
          "50%":  { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%,100%": { opacity: 0.5, filter: "drop-shadow(0 0 0px rgba(34,197,94,0.0))" },
          "50%":     { opacity: 1,   filter: "drop-shadow(0 0 12px rgba(34,197,94,0.35))" },
        },
      },
      animation: {
        progress: "progress 1.4s ease-in-out infinite",
        glow: "glow 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
