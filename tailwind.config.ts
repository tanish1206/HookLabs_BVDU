import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        background: "#0A0A0F",
        surface: "#12121A",
        surface2: "#1A1A26",
        surface3: "#22223A",
        accent: "#7C5CFC",
        accent2: "#5B8EFF",
        amber: "#F59E0B",
        green: "#22C55E",
        red: "#EF4444",
        border: "rgba(255,255,255,0.07)",
        border2: "rgba(255,255,255,0.12)",
        text: "#F0EFFF",
        muted: "rgba(240,239,255,0.45)",
        muted2: "rgba(240,239,255,0.25)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "22px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
