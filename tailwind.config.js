/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f5',
          100: '#edecea',
          200: '#dbd9d4',
          300: '#c2bfb7',
          400: '#a7a295',
          500: '#918a7a',
          600: '#7d756a',
          700: '#685f56',
          800: '#574f48',
          900: '#4a443e',
          950: '#282420',
        },
        accent: {
          DEFAULT: '#c45d3e',
          light: '#e8957a',
          dark: '#9e3f24',
        },
        success: '#4a8c6f',
        warning: '#d4a843',
        danger: '#c44b4b',
      },
    },
  },
  plugins: [],
};
