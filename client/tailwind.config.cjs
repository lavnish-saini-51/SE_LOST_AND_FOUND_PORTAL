/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glass: "0 10px 30px rgba(2,6,23,.18)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")]
};
