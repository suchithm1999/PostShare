/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#63b3ed', // Simplified primary (Light Blue)
        secondary: '#9f7aea', // Simplified secondary (Purple)
        dark: '#1a202c', // Dark mode background
        light: '#e5e7eb', // Light mode background (gray-200) for better card contrast
      },
      borderRadius: {
        'xl': '1rem', // Rounded corners
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
