/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: "#FDB9C8",
        deepblue: "#004CA0",
        luxuryblack: "#000000",
      },
      fontFamily: {
        sans: ["Poppins", "Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [],
};
