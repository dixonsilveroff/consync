import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── shadcn Required Tokens (CSS Variable References) ───
        background: "var(--surface)",
        foreground: "var(--on-surface)",
        card: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface)",
        },
        popover: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface)",
        },
        muted: {
          DEFAULT: "var(--surface-container)",
          foreground: "var(--on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface)",
        },
        destructive: {
          DEFAULT: "var(--critical-red)",
          foreground: "#ffffff",
        },
        border: "var(--outline-variant)",
        input: "var(--outline-variant)",
        ring: "var(--primary-hex, #adc8f5)",
        // ─── Surface Hierarchy (Enforcer Architect) ───
        surface: {
          DEFAULT: "#111316",
          "container-lowest": "#0d0e10",
          "container-low": "#1a1c1f",
          "container": "#222427",
          "container-high": "#282a2d",
          "container-highest": "#333538",
          bright: "#3a3c3f",
        },
        // ─── Brand Colors ───
        primary: {
          DEFAULT: "#adc8f5",
          foreground: "#0a1929",
          container: "#1e3a5f",
          "on": "#0a1929",
        },
        secondary: {
          DEFAULT: "#333538",
          foreground: "#e2e2e5",
        },
        // ─── Semantic Colors ───
        "control-green": "#2E7D32",
        "critical-red": "#D32F2F",
        "warning-amber": "#F9A825",
        // ─── Outline ───
        outline: {
          DEFAULT: "#8e9099",
          variant: "#43474e",
        },
        // ─── On-surface ───
        "on-surface": {
          DEFAULT: "#e2e2e5",
          variant: "#c4c6cf",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.1", fontWeight: "600" }],
        "display-md": ["2.75rem", { lineHeight: "1.15", fontWeight: "600" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-lg": ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-md": ["1.5rem", { lineHeight: "1.35", fontWeight: "600" }],
        "headline-sm": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "label-lg": ["0.875rem", { lineHeight: "1.45", fontWeight: "500" }],
        "label-md": ["0.75rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.05em" }],
        "label-sm": ["0.6875rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.08em" }],
        "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      borderRadius: {
        // Enforcer Architect: 0px radius everywhere
        none: "0px",
      },
      boxShadow: {
        ambient: "0px 20px 40px rgba(0, 0, 0, 0.4)",
        subtle: "0px 4px 12px rgba(0, 0, 0, 0.25)",
      },
      spacing: {
        "section": "1.75rem",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #adc8f5, #1e3a5f)",
        "cta-gradient-hover": "linear-gradient(135deg, #c4d8f9, #2a4d75)",
      },
    },
  },
  plugins: [],
};
export default config;
