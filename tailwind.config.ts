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
        // ─── ConSync v2.0 Brand Colors ───
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
          faint: "var(--color-primary-faint)",
          foreground: "var(--color-text-inverse)",
        },
        
        // ─── Backgrounds ───
        background: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },

        // ─── Text ───
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
        
        // ─── shadcn mappings (to support UI components) ───
        foreground: "var(--color-text-primary)",
        card: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-primary)",
        },
        popover: {
          DEFAULT: "var(--color-surface-raised)",
          foreground: "var(--color-text-primary)",
        },
        secondary: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text-secondary)",
        },
        muted: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-primary-faint)",
          foreground: "var(--color-primary)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "var(--color-text-inverse)",
        },
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary-light)",

        // ─── Status / Semantic Colors ───
        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
          border: "var(--color-success-border)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg: "var(--color-warning-bg)",
          border: "var(--color-warning-border)",
        },
        escrow: {
          DEFAULT: "var(--color-escrow)",
          bg: "var(--color-escrow-bg)",
          border: "var(--color-escrow-border)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg: "var(--color-danger-bg)",
          border: "var(--color-danger-border)",
        },
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        "h1": ["2.25rem", { lineHeight: "1.2", fontWeight: "600" }],
        "h2": ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }],
        "h3": ["1.375rem", { lineHeight: "1.4", fontWeight: "600" }],
        "h4": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "small": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "micro": ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
        "label-lg": ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],
      },
      borderRadius: {
        none: "0px",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
        release: "var(--duration-release)",
      },
      transitionTimingFunction: {
        "ease-out": "var(--ease-out)",
        "ease-in": "var(--ease-in)",
        "ease-in-out": "var(--ease-in-out)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, var(--color-primary-light), var(--color-primary))",
        "cta-gradient-hover": "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
      },
    },
  },
  plugins: [],
};
export default config;
