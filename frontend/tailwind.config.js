module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#75acff',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
