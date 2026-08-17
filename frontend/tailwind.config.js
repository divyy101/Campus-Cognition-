/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        page: {
          main: 'var(--bg-main)',
          secondary: 'var(--bg-secondary)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
        },
        theme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          accent: 'var(--accent)',
          accent2: 'var(--accent-secondary)',
          border: 'var(--border)',
          'border-strong': 'var(--border-strong)',
          glow: 'var(--glow)',
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          900: '#0a192f',
          800: '#112240',
          700: '#233554',
        },
        gold: {
          400: '#f59e0b',
          500: '#d97706',
        }
      },
      boxShadow: {
        glow: '0 0 20px 2px var(--glow)',
        card: '0 4px 20px -2px var(--shadow)',
      }
    },
  },
  plugins: [],
}
