/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    keyframes: {
      'slide-in-left': {
        '0%': { transform: 'translateX(-100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' }
      },
      'slide-out-left': { // Bu bir keyframes tanımı olmalı
        '0%': { transform: 'translateX(0)', opacity: '1' },
        '100%': { transform: 'translateX(-100%)', opacity: '0' }
      },
      'slide-inright': {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' }
      },
      'slide-out-right': {
        '0%': { transform: 'translateX(0)', opacity: '1' },
        '100%': { transform: 'translateX(100%)', opacity: '0' }
      }
    },
    animation: {
      'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
      'slide-out-left': 'slide-out-left 0.5s ease-out forwards',
      'slide-in-right': 'slide-inright 0.5s ease-out forwards',
      'slide-out-right': 'slide-out-right 0.5s ease-out forwards'
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}