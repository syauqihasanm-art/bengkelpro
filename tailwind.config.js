/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bengkel: {
          navy: "#101D35",
          "navy-light": "#1B2E52",
          "navy-dark": "#0A1324",
          orange: "#F28C28",
          "orange-hover": "#D9771E",
          "orange-light": "#FFF3E6",
          bg: "#F5F7FA",
          surface: "#FFFFFF",
          green: "#16A36A",
          "green-light": "#E8F7F0",
          red: "#DC4141",
          "red-light": "#FDEAEA",
          text: "#202938",
          muted: "#64748B",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
