/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand — Emerald (matches web)
        primary: {
          DEFAULT: '#059669',
          light: '#34d399',
          dark: '#047857',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        // Dark surface system
        background: {
          DEFAULT: '#0d1117',
          card: '#161b22',
          elevated: '#1c2128',
          border: '#21262d',
        },
        // Text hierarchy
        content: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#484f58',
          inverse: '#0d1117',
        },
        // Semantic
        danger: { DEFAULT: '#dc2626', light: '#f87171', muted: '#7f1d1d' },
        warning: { DEFAULT: '#d97706', light: '#fbbf24', muted: '#78350f' },
        info: { DEFAULT: '#2563eb', light: '#60a5fa', muted: '#1e3a8a' },
        success: { DEFAULT: '#059669', light: '#34d399', muted: '#064e3b' },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['JetBrainsMono', 'Courier'],
      },
      spacing: {
        safe: '16px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
