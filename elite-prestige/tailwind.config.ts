import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        goldlight: "rgb(var(--color-goldlight) / <alpha-value>)",
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        gray1: "rgb(var(--color-gray1) / <alpha-value>)",
        gray2: "rgb(var(--color-gray2) / <alpha-value>)"
      },
      fontFamily: {
        jost: ["Jost", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
