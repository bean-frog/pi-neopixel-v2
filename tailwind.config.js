/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["public/index.html"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        rgbcolors: {
          primary: "#FF0000",
          secondary: "#00FF00",
          accent: "#0000FF"
        }
      }
    ]
  }
}

