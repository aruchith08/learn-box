/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F4F1EB',
        nearblack: '#111111',
        brutal: {
          bg: '#F4F1EB',
          card: '#FFFFFF',
          dark: '#111111',
          header: '#111111',
          border: '#111111',
          yellow: '#FFE600',
          yellowLight: '#FEF08A',
          mint: '#A7F3D0',
          lavender: '#DDD6FE',
          pink: '#FECDD3',
          skyblue: '#BAE6FD',
          muted: '#666666',
        }
      },
      fontFamily: {
        display: ['Kanit', 'Impact', 'Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #111111',
        'brutal': '3px 3px 0px #111111',
        'brutal-lg': '4px 4px 0px #111111',
        'brutal-xl': '5px 5px 0px #111111',
      }
    },
  },
  plugins: [],
};
