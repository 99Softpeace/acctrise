import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark mode premium palette
        "dark-bg": "#0f0f1e",
        "dark-surface": "#1a1a2e",
        "dark-surface-light": "#25254a",
        "dark-border": "rgba(99, 102, 241, 0.1)",
        
        // Light mode palette
        "light-bg": "#ffffff",
        "light-surface": "#f8f9ff",
        "light-border": "rgba(37, 42, 76, 0.12)",
        
        // Brand colors
        primary: {
          50: "#f0f4ff",
          100: "#e1e8ff",
          200: "#c2d1ff",
          300: "#a3bbff",
          400: "#6366f1",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b"
        },
        secondary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#3f0f5c"
        },
        accent: {
          purple: "#7c3cff",
          cyan: "#23c7ff",
          pink: "#ff4da6",
          orange: "#ff9d2f",
          green: "#18c58f"
        }
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(99, 102, 241, 0.32)",
        glass: "0 8px 32px 0 rgba(99, 102, 241, 0.15)",
        soft: "0 22px 70px rgba(10, 16, 48, 0.18)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"]
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "20px"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 24px 80px rgba(99, 102, 241, 0.32)" },
          "50%": { opacity: "0.8", boxShadow: "0 24px 80px rgba(99, 102, 241, 0.16)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
