/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandPink: "#FDB9C8",
        brandBlue: "#004CA0",
        brandBlack: "#111111"
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.15)"
      },
      backdropBlur: {
        xs: "2px"
      }
    },
  },
  plugins: [],
};
