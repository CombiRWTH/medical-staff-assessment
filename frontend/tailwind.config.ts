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
        container: '#FFFFFF'
      },
    },
  },
  plugins: [],
} satisfies Config
