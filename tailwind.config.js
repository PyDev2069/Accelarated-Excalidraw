/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        caveat: ["Caveat", "cursive"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        paper: "#fffdf7",
        ink: "#1b1b1f",
        dotgrid: "#e5e1d8",
        muted: "#4a4a55",
        mutedlight: "#6b6b76",
        indigo: {
          DEFAULT: "#6965db",
          light: "#7d79e8",
        },
        orange: "#e8734a",
        yellow: "#ffd93d",
        green: "#4a9f5c",
      },
    },
  },
  plugins: [],
};

