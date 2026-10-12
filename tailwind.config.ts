import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090B10",
        surface: "#11151D",
        elevated: "#191F2A",
        border: "#29313D",
        "border-subtle": "#1C222C",
        text: {
          DEFAULT: "#F4F6FA",
          secondary: "#929BAA",
          muted: "#657082",
        },
        brand: {
          DEFAULT: "#A3E635",
          hover: "#BEF264",
          muted: "rgba(163, 230, 53, 0.12)",
        },
        positive: "#34D399",
        negative: "#FB7185",
        info: "#60A5FA",
        warning: "#FBBF24",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display": ["30px", { lineHeight: "36px", fontWeight: "660" }],
        "section": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "card": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body": ["14px", { lineHeight: "22px" }],
        "secondary": ["13px", { lineHeight: "20px" }],
        "label": ["12px", { lineHeight: "18px", fontWeight: "500" }],
        "kpi": ["32px", { lineHeight: "38px", fontWeight: "650" }],
        "btn": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "micro": ["11px", { lineHeight: "16px" }],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      spacing: {
        sidebar: "248px",
        "sidebar-collapsed": "72px",
        header: "64px",
      },
      maxWidth: {
        content: "1600px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
        "fade-in": "fade-in 220ms ease-out",
        "slide-in-right": "slide-in-right 220ms cubic-bezier(0.32, 0.72, 0, 1)",
        "scale-in": "scale-in 150ms ease-out",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4)",
        elevated: "0 12px 32px -8px rgba(0,0,0,0.65)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
