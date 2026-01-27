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
        'brand-primary': '#0C0A09',
        'brand-bg': '#0A0908',
        'brand-accent': '#F97316',
        'brand-accent-dark': '#EA580C',
        'brand-accent-gold': '#FBBF24',
        'brand-surface': '#1C1917',
        'brand-surface-elevated': '#292524',
        'brand-text-primary': '#FAFAF9',
        'brand-text-secondary': '#A8A29E',
        'brand-border': '#44403C',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
