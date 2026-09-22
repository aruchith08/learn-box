/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: '#ECECEC',
          card: '#FFFFFF',
          dark: '#0A0A0A',
          header: '#111111',
          border: '#000000',
          orange: '#FF5E1E',
          orangeHover: '#E84E0F',
          orangeLight: '#FF7A45',
          green: '#4ADE80',
          yellow: '#FBBF24',
          red: '#F87171',
          muted: '#666666',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #000000',
        'brutal': '3px 3px 0px #000000',
        'brutal-lg': '4px 4px 0px #000000',
      }
    },
  },
  plugins: [],
};
