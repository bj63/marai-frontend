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
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #A47CFF, #3CE0B5, #FF9ECF)',
      },
      boxShadow: {
        'brand-glow': '0 0 35px rgba(164, 124, 255, 0.28)',
      },
      borderRadius: {
        brand: '12px',
      },
    },
  },
  plugins: [],
}

export default config
