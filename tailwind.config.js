/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          600: '#222222',
          500: '#2a2a2a',
          400: '#333333',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#3b82f6',
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.accent.primary), 0 0 20px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
} 