/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080810',
          900: '#0D0D18',
          800: '#12121F',
          700: '#1A1A2E',
          600: '#22223A',
          500: '#2E2E4A',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FF9A9A',
          dark: '#E85555',
        },
        jade: '#10B981',
        lavender: '#A855F7',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
