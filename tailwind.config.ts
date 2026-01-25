import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1B3A57',
        'brand-bg': '#0F1419',
        'brand-accent': '#00A5E0',
        'brand-accent-dark': '#1B3A57',
        'brand-surface': '#1A2332',
        'brand-text-primary': '#F0F4F8',
        'brand-text-secondary': '#B0BEC5',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
