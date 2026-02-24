import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#1a2332",
        primary: "#ffffff",
        muted: "#7A8A9A",
        amber: "#F5A623",
        red: "#FF5555",
        green: "#00CC88"
      },
      fontFamily: {
        inter: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 204, 136, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
