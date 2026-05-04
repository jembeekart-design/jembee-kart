/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // manual dark mode control

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
      // 🎨 Premium Color System
      colors: {
        primary: {
          DEFAULT: "#6366F1", // Indigo
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#06B6D4", // Cyan
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        darkbg: "#0f172a",
      },

      // 🌈 Gradient presets
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
      },

      // 🔥 Shadows (premium feel)
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
        card: "0 4px 20px rgba(0,0,0,0.05)",
        glow: "0 0 20px rgba(99,102,241,0.5)",
      },

      // 🧱 Border radius system
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      // ⚡ Animations
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
      },

      // 📱 Responsive fonts (clean UI)
      fontSize: {
        xs: ["0.75rem", "1rem"],
        sm: ["0.875rem", "1.25rem"],
        base: ["1rem", "1.75rem"],
        lg: ["1.125rem", "1.75rem"],
        xl: ["1.25rem", "1.75rem"],
        "2xl": ["1.5rem", "2rem"],
        "3xl": ["2rem", "2.5rem"],
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
