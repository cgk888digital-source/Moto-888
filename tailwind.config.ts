import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
      colors: {
        bg: '#0c0c0c',
        surface: '#161616',
        'surface-2': '#1e1e1e',
        border: '#2a2a2a',
        accent: '#f59e0b',
        'accent-hover': '#d97706',
        secondary: '#00E5FF',
        'secondary-hover': '#00C8E0',
        'secondary-muted': 'rgba(0,229,255,0.12)',
        'text-base': '#f0f0f0',
        'text-muted': '#737373',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
