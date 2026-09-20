/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#17201e", cream: "#f4f1ea", paper: "#fbfaf7", coral: "#f06d4f", sage: "#cbd8c7", dark: "#203d35" },
      fontFamily: { sans: ["Manrope", "sans-serif"], mono: ["DM Mono", "monospace"] }
    }
  },
  plugins: []
};
