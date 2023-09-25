/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./_themes/tm3/layouts/*.html",
    "./_themes/tm3/partials/**/*.html",
    "./_themes/tm3/templates/*.html",
  ],
  theme: {
    extend: {
      textShadow: {
        DEFAULT: "0 0 2px rgba(0, 0, 0, .9)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      )
    }),
  ],
}

