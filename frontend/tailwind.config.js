/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0B0E1A",
          900: "#111527",
          800: "#141A2E",
          700: "#1D2438",
          600: "#2A3350",
        },
        primary: {
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        accent: {
          violet: "#8B5CF6",
          pink: "#EC4899",
          cyan: "#22D3EE",
        },
        success: "#34D399",
        warn: "#FBBF24",
        danger: "#F87171",
      },
      fontFamily: {
        display: ["Lexend", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "signature-gradient": "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #EC4899 100%)",
        "glow-radial": "radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0) 70%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(139,92,246,0.5)",
        card: "0 4px 24px -4px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ring-spin": "spin 6s linear infinite",
      },
    },
  },
  plugins: [],
};