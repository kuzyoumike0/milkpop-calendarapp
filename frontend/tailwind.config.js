/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // React ソース
    "./public/index.html",         // index.html も対象
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
