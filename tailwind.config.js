/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#eef4fb',
          100: '#d7e5f4',
          200: '#afcae9',
          300: '#7da6d8',
          400: '#4e84c4',
          500: '#2e68ab',
          600: '#1e3a5f',
          700: '#1a3050',
          800: '#162740',
          900: '#111d30',
        },
        accent: {
          50: '#fff3ed',
          100: '#ffe2d4',
          200: '#ffc0a3',
          300: '#ff9a6b',
          400: '#ff7a42',
          500: '#ff6b35',
          600: '#f0531a',
          700: '#c94215',
          800: '#a03616',
          900: '#812f16',
        },
        'lab-bg': '#f0f4f8',
        'lab-surface': '#ffffff',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Noto Serif SC"', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(30, 58, 95, 0.08)',
        'hover': '0 8px 30px -4px rgba(30, 58, 95, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
