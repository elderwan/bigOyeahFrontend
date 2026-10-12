import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17221f",
        moss: "#315c4d",
        sage: "#e8f0e8",
        sand: "#f6f3ec",
        terracotta: "#d9785b",
        gold: "#d8a84e"
      },
      boxShadow: {
        card: "0 18px 50px rgba(39, 58, 48, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
