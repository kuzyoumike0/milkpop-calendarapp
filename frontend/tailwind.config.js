// frontend/tailwind.config.js
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"  // ← ここが大事
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
