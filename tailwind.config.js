/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: "#0B0F14",
        panel: "#0F141B",
        "panel-2": "#141C26",
        "panel-3": "#1B2531",
        line: "#243140",
        hairline: "#1A2330",
        amber: {
          DEFAULT: "#FFB300",
          soft: "#FFC857",
          deep: "#C77E00",
        },
        good: "#2EC27E",
        bad: "#FF5A5F",
        slatey: {
          DEFAULT: "#8A97A6",
          dim: "#5A6675",
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        sans: ['"Noto Sans SC"', '"Chakra Petch"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,179,0,0.35), 0 0 28px -6px rgba(255,179,0,0.55)",
        "glow-good": "0 0 0 1px rgba(46,194,126,0.35), 0 0 26px -8px rgba(46,194,126,0.6)",
        "glow-bad": "0 0 0 1px rgba(255,90,95,0.35), 0 0 26px -8px rgba(255,90,95,0.6)",
        inset: "inset 0 2px 6px rgba(0,0,0,0.45)",
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.97)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 1.6s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        sweep: "sweep 8s linear infinite",
        marquee: "marquee 18s linear infinite",
      },
    },
  },
  plugins: [],
};
