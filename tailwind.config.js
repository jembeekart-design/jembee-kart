/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",   // ✅ FIX
    "./shared/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.{js,ts,jsx,tsx}",
    "./seller/**/*.{js,ts,jsx,tsx}",
    "./customer/**/*.{js,ts,jsx,tsx}"
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
      }
    }
  },

  plugins: []
};
