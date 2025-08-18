/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        accent: "#FDB9C8",
        accentSub: "#004CA0",
        text: "#EEEEEE",
        textSub: "#B0BEC5"
      },
      boxShadow: {
        glass: "0 8px 24px rgba(0,0,0,0.3)"
      }
    },
  },
  plugins: [],
}
