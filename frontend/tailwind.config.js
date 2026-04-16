/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          bg: '#F7F5F0',
          card: '#FFFFFF',
          border: '#E2DDD5',
          'border-light': '#EDE9E3',
          muted: '#6B6560',
          soft: '#B5B0A8',
        },
        navy: {
          DEFAULT: '#1E3A5F',
          light: '#2A4F82',
          pale: '#EBF0F7',
        },
        amber: {
          DEFAULT: '#C4780A',
          light: '#E8A030',
          pale: '#FEF3E2',
        },
        ink: '#1A1815',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse3: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease forwards',
        fadeIn: 'fadeIn 0.4s ease forwards',
        slideRight: 'slideRight 0.35s ease forwards',
        dot1: 'pulse3 1.4s ease-in-out infinite',
        dot2: 'pulse3 1.4s ease-in-out 0.2s infinite',
        dot3: 'pulse3 1.4s ease-in-out 0.4s infinite',
      },
    },
  },
  plugins: [],
}
