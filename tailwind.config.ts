import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: '#00FFF0',
        brand: {
          magnolia: '#A47CFF',
          bayou: '#3CE0B5',
          cypress: '#FF9ECF',
          midnight: '#0B1024',
          mist: '#C8D2E1',
        },
        surface: {
          base: '#0D132B',
          raised: '#131B3D',
          sunken: '#080C1F',
        },
        state: {
          success: '#3CE0B5',
          warning: '#FACC15',
          danger: '#FB7185',
          info: '#38BDF8',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #A47CFF, #3CE0B5, #FF9ECF)',
      },
      boxShadow: {
        'brand-glow': '0 0 35px rgba(164, 124, 255, 0.28)',
        'surface-sm': '0 12px 35px rgba(8, 12, 30, 0.45)',
        surface: '0 24px 65px rgba(9, 12, 32, 0.55)',
        'surface-lg': '0 32px 80px rgba(6, 10, 28, 0.65)',
      },
      borderRadius: {
        brand: '12px',
      },
      spacing: {
        gutter: '1.5rem',
        'gutter-lg': '2.5rem',
      },
      maxWidth: {
        shell: '1200px',
        'shell-wide': '1280px',
        'shell-narrow': '880px',
      },
      fontSize: {
        xxs: '0.65rem',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 0.5s ease-out both',
      },
      transitionTimingFunction: {
        'enter-expressive': 'cubic-bezier(.16,1,.3,1)',
        'exit-expressive': 'cubic-bezier(.7,0,.84,0)',
      },
    },
  },
  plugins: [],
}

export default config
