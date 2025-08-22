// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // content 배열에 아래 경로를 추가하거나 수정합니다.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors:{
        brown: '#4B3939',
        lightBrown: '#8F6868',
        black: '#030303',
        gray: '#D9D9D9',
        pink: '#E5D0D0',
        pinkBrown: '#C5A0A0',
        lightPink: '#FEEEEE',
        light: '#F9F1F1',
        browny: '#785D5D',

      },
      fontFamily: {
          julius: ['"Julius Sans One"', 'sans-serif'],
          junge: ['"Junge"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}