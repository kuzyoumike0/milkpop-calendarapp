// tailwind.config.js
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    "bg-pink-500",
    "bg-blue-600",
    "text-white",
    "rounded-lg"
  ],
  theme: { extend: {} },
  plugins: [],
};
