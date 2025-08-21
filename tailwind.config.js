// frontend/tailwind.config.js
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brandPink: "#FDB9C8",
        brandBlue: "#004CA0",
      },
    },
  },
  plugins: [],
};
