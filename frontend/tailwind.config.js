/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: { 500: '#f97316' }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 32px rgba(37,99,235,0.18)',
        'nav': '0 2px 16px rgba(0,0,0,0.08)',
        'dropdown': '0 16px 48px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
};
