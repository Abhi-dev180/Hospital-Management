/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: '#1E40AF',
          light: '#DBEAFE',
          dark: '#1E3A8A',
          white: '#FFFFFF',
          gray: '#F3F4F6'
        }
      }
    },
  },
  plugins: [],
}
