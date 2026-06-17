/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
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
        soft: "0 16px 48px rgba(23, 33, 29, 0.10)",
        card: "0 2px 12px rgba(23, 33, 29, 0.07)"
      },
      borderOpacity: {
        8: "0.08",
        12: "0.12"
      }
    }
  },
  plugins: []
};
