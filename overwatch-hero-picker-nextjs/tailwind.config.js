/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c3e50',
        secondary: '#f06414',
        accent: '#ffa500',
      },
      fontFamily: {
        overwatch: ['Big Noodle Titling', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
