/* FILE: tailwind.config.js */

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
    "./customer/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.{js,ts,jsx,tsx}",
    "./seller/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)"
      },

      backdropBlur: {
        glass: "var(--glass-blur)"
      },

      borderColor: {
        glass: "var(--glass-border)"
      },

      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      },

      borderRadius: {
        xl2: "1.25rem"
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          background: "rgba(255, 255, 255, var(--glass-opacity))",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "var(--glass-border)"
        },

        ".glass-dark": {
          background: "rgba(0, 0, 0, var(--glass-opacity))",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "var(--glass-border)"
        }
      });
    }
  ]
};