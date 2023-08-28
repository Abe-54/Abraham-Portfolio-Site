/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#599fc0",
        primaryHover: "#0b2735",
        lightMode: {
          text: "#081d27",
          background: "#ffffff",
          secondary: "#cae2ec",
          accent: "#17303b",
        },
        darkMode: {
          text: "#ffffff",
          background: "#081d27",
          secondary: "#081216",
          accent: "#428aa9",
        },
      },
      height: {
        screen: ["100vh", "100dvh"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
