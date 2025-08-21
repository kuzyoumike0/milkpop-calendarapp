/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/src/**/*.{js,jsx,ts,tsx}", // Reactのコンポーネント全部
    "./frontend/public/index.html"         // HTMLも対象
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
