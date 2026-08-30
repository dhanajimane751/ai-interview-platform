/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        base: {
          950: "var(--bg)",
          900: "var(--surface)",
          800: "var(--surface-2)",
          700: "var(--border)",
          600: "var(--border-strong)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
        },
        signal: "var(--accent)",
        mint: "var(--mint)",
        primary: {
          400: "var(--accent-hover)",
          500: "var(--accent)",
          600: "var(--accent)",
          700: "var(--accent)",
        },
        accent: {
          violet: "var(--accent)",
          pink: "var(--accent)",
          cyan: "var(--accent)",
        },
        success: "var(--mint)",
        warn: "#E8A33D",
        danger: "#E8543D",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "signature-gradient": "none",
        "glow-radial": "none",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06)",
        glow: "none",
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ring-spin": "spin 6s linear infinite",
      },
    },
  },
  plugins: [],
};