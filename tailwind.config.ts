import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f7f9",
        foreground: "#2c2f31",
        primary: "#4647d3",
        "primary-container": "#9396ff",
        secondary: "#6a37d4",
        "secondary-container": "#dac9ff",
        tertiary: "#00628c",
        "tertiary-container": "#40bbff",
        surface: "#f5f7f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eef1f3",
        "surface-container": "#e5e9eb",
        "surface-container-high": "#dfe3e6",
        "surface-container-highest": "#d9dde0",
        "on-background": "#2c2f31",
        "on-surface": "#2c2f31",
        "on-surface-variant": "#595c5e",
        "on-primary": "#f4f1ff",
        "on-primary-container": "#0a0081",
        "on-secondary-container": "#5517bf",
        outline: "#747779",
        "outline-variant": "#abadaf"
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        hero: "0 24px 80px rgba(99, 102, 241, 0.18)"
      },
      maxWidth: {
        content: "1440px"
      }
    }
  },
  plugins: []
};

export default config;
