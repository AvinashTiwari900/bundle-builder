/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        warmBg: '#FAF9F6',
        warmCard: '#FFFEFB',
        warmMuted: '#F2F0EB',
        warmBorder: '#E5E2DC',
        warmText: '#171717',
        warmSecondary: '#686660',
      }
    },
  },
  plugins: [],
}
