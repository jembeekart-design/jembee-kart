/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },

    extend: {
      // 🎨 THEME COLORS (CSS VARIABLE BASED)
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "#000000",
        },

        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
      },

      // 🌈 PREMIUM GRADIENTS
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))",
        "gradient-accent":
          "linear-gradient(135deg, rgb(var(--color-accent)), #ef4444)",
      },

      // 🔥 SHADOW SYSTEM (REALISTIC)
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.15)",
        card: "0 8px 30px rgba(0,0,0,0.25)",
        glow: "0 0 30px rgba(99,102,241,0.5)",
      },

      // 🧱 BORDER RADIUS
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      // 🌫️ GLASS BLUR
      backdropBlur: {
        xs: "2px",
        sm: "6px",
        md: "12px",
        lg: "20px",
      },

      // ⚡ ANIMATIONS
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
      },

      // 📱 TYPOGRAPHY SCALE
      fontSize: {
        xs: ["0.75rem", "1rem"],
        sm: ["0.875rem", "1.25rem"],
        base: ["1rem", "1.75rem"],
        lg: ["1.125rem", "1.75rem"],
        xl: ["1.25rem", "1.75rem"],
        "2xl": ["1.5rem", "2rem"],
        "3xl": ["2rem", "2.5rem"],
        "4xl": ["2.5rem", "3rem"],
      },

      // ⚡ SMOOTH MOTION
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
