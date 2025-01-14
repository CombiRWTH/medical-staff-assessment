import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#527AFF',
        background: '#EEEEEE',
        container: '#FFFFFF',
        disabled: '#999999'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '50%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-in-out',
      },
      components: {
        '.button-full-primary': {
          '@apply px-4 py-2 rounded-md text-white bg-primary hover:bg-primary/80': {},
        },
        '.button-tonal-primary': {
          '@apply px-4 py-2 rounded-md text-white bg-primary/30 hover:bg-primary/50': {},
        },
      },
    },
  },
  plugins: [

  ],
} satisfies Config
