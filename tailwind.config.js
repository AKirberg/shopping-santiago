/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "ui-serif", "serif"]
      },
      colors: {
        ink: "#17211d",
        mist: "#eef4ef",
        leaf: "#12615b",
        coral: "#e36b45",
        gold: "#c28b2c",
        night: "#1f3144"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(31, 49, 68, 0.12)"
      }
    }
  },
  plugins: []
};
