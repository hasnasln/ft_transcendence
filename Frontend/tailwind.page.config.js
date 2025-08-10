/** @type {import('tailwindcss').Config} */
export default {
  content: (process.env.PAGE_GLOBS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
  theme: {
    extend: {
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' }
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-out-left': 'slide-out-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'slide-out-right': 'slide-out-right 0.5s ease-out forwards',
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
