import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#111316",
        "surface-container-low": "#1a1c1f",
        "surface-container-high": "#282a2d",
        "surface-container-highest": "#333538",
        primary: "#adc8f5",
        "primary-container": "#1e3a5f",
        danger: "#d32f2f",
        success: "#2e7d32"
      },
      borderRadius: {
        none: "0px"
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #adc8f5 0%, #1e3a5f 100%)"
      }
    }
  },
  plugins: []
};

export default config;
