// frontend/tailwind.config.js
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // ← src 以下を監視
  ],
  theme: {
    extend: {
      colors: {
        pink: "#FDB9C8",
        deepblue: "#004CA0",
      },
    },
  },
  plugins: [],
};
