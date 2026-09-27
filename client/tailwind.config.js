/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        slate: {
          850: '#151c2c',
          900: '#0f172a',
          950: '#090d16',
        },
        arena: {
          primary: '#6366f1',
          accent: '#8b5cf6',
          dark: '#0a0d14',
          card: '#111726',
          border: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
