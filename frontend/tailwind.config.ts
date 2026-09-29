import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 1px 2px rgba(15, 42, 42, 0.04), 0 12px 32px rgba(15, 42, 42, 0.06)',
      },
      colors: {
        ink: '#152725',
        moss: '#0d615b',
        mist: '#f5f8f7',
      },
    },
  },
  plugins: [],
} satisfies Config
