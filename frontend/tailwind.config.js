// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/src/**/*.{js,jsx,ts,tsx}", // Reactの全コンポーネント
    "./frontend/public/index.html"         // HTML
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
