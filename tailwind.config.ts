import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 수영/물 테마 — 시원한 블루 & 틸
        water: {
          50: "#eff9ff",
          100: "#dcf1ff",
          200: "#b2e5ff",
          300: "#6dd2ff",
          400: "#20bcff",
          500: "#00a2f0",
          600: "#0081cc",
          700: "#0067a5",
          800: "#065788",
          900: "#0b4870",
          950: "#072d4a",
        },
        teal: {
          50: "#effefb",
          100: "#c8fff3",
          200: "#91ffe8",
          300: "#52f7db",
          400: "#1de4c8",
          500: "#04c8af",
          600: "#00a290",
          700: "#058174",
          800: "#0a655d",
          900: "#0d544d",
          950: "#003330",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-pretendard)",
          "Pretendard",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        water: "0 10px 30px -12px rgba(0, 129, 204, 0.35)",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        ripple: "ripple 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
