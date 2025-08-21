/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // React のソースを監視
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004CA0",
        accent: "#FDB9C8"
      },
      fontFamily: {
        sans: ["Soleil", "sans-serif"] // ローカルフォント設定
      }
    }
  },
  plugins: []
};
