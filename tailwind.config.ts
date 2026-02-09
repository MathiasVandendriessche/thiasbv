import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2026 Color Trends: Digital Lavender & Neo-Neutral Earth Tones
        primary: {
          50: "#f5f3ff",   // Soft lavender tint
          100: "#ede9fe",  // Digital Lavender light
          200: "#ddd6fe",  // Digital Lavender
          300: "#c4b5fd",  // Digital Lavender medium
          400: "#a78bfa",  // Digital Lavender vibrant
          500: "#8b5cf6",  // Digital Lavender main
          600: "#7c3aed",  // Digital Lavender deep
          700: "#6d28d9",  // Digital Lavender darker
          800: "#5b21b6",  // Digital Lavender dark
          900: "#4c1d95",  // Digital Lavender darkest
        },
        // Mocha Mousse - Pantone 2026 Color of the Year
        earth: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#e8ddd0",
          300: "#d4c4b0",
          400: "#b8a088",
          500: "#9d7f6a",  // Mocha Mousse
          600: "#7d6554",
          700: "#645045",
          800: "#524139",
          900: "#453730",
        },
        // Neo-Neutral Earth Tones: Eucalyptus Green
        sage: {
          50: "#f6f7f6",
          100: "#e3e7e3",
          200: "#c7d1c7",
          300: "#a3b3a3",
          400: "#7d937d",
          500: "#5f7a5f",  // Eucalyptus Green
          600: "#4a614a",
          700: "#3d4f3d",
          800: "#344234",
          900: "#2d382d",
        },
        // Hyper-Saturated Primaries (accent colors)
        accent: {
          blue: "#0066ff",   // Hyper-saturated blue
          red: "#ff3333",   // Hyper-saturated red
          yellow: "#ffcc00", // Hyper-saturated yellow
        },
        servicenow: {
          DEFAULT: "#81B5A1",
          dark: "#2E7D32",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
