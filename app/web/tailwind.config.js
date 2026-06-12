/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verde neon OMNIFETCH sobre fundo quase-preto esverdeado
        omni: {
          DEFAULT: '#00e676',
          bright: '#39ffa0',
          dim: '#00c853',
          deep: '#003b22',
          glow: 'rgba(0, 230, 118, 0.35)',
        },
        ink: {
          950: '#04080a',
          900: '#070d10',
          850: '#0a1216',
          800: '#0e171c',
          700: '#16232a',
          600: '#22343d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 230, 118, 0.25)',
        'glow-lg': '0 0 48px rgba(0, 230, 118, 0.30)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(0,230,118,0.18)' },
          '50%': { boxShadow: '0 0 32px rgba(0,230,118,0.38)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
