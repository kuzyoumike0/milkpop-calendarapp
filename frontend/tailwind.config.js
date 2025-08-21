// frontend/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {},
  },
  safelist: [
    "bg-gray-900",
    "hover:bg-gray-800",
    "text-white",
    "rounded-2xl",
    "shadow-lg",
    "transition",
    "transform",
    "hover:scale-105",
  ],
  plugins: [],
};
