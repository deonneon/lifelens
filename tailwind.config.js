/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // surfaces — the "archive at night" stack, darkest to lightest
        canvas: '#0B0C12',
        'surface-1': '#12141C',
        'surface-2': '#181B25',
        'surface-3': '#1F2330',
        // hairlines
        edge: 'rgba(148, 163, 199, 0.14)',
        'edge-bright': 'rgba(148, 163, 199, 0.28)',
        // ink — text hierarchy
        ink: {
          50: '#F4F5FA',
          100: '#E5E7F0',
          300: '#B9BDCE',
          400: '#8F94A9',
          500: '#6E7389',
          600: '#4C5065',
        },
        // brand accent — iris
        accent: {
          DEFAULT: '#7C6CF0',
          bright: '#948AF6',
          deep: '#5B4BD4',
        },
        // evidence status (contrast-validated against surface-1; always labeled)
        status: {
          good: '#34D399', // corroborated
          info: '#38BDF8', // single source
          bad: '#FB7185', // disputed
          warn: '#FBBF24', // rumor
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(124,108,240,0.35), 0 4px 24px -6px rgba(124,108,240,0.45)',
        pop: '0 12px 40px -12px rgba(0,0,0,0.7)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
}
