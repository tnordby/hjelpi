import type { Config } from 'tailwindcss'

/**
 * Hjelpi brand tokens — "Hjelpi Ink" (see design/DESIGN.md).
 * White canvas with light neutral section blocks (bark.com / thumbtack.com
 * feel), ink-black primary (wordmark, headlines, pill buttons), terracotta
 * as the single playful accent, ochre-gold for stars/eyebrows. Semantic names
 * kept from the original Material scheme so every component picks the brand
 * up automatically.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        surface: '#ffffff',
        'surface-bright': '#ffffff',
        'surface-container': '#f0efeb',
        'surface-container-low': '#f7f6f3',
        'surface-container-high': '#e8e6e0',
        'surface-container-highest': '#dfdcd4',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#efede8',
        'surface-dim': '#e5e2da',
        primary: '#1f1c17',
        'on-primary': '#ffffff',
        'primary-container': '#37332b',
        'on-primary-container': '#efede8',
        secondary: '#c2521d',
        'on-secondary': '#fffcf5',
        'secondary-container': '#f9e8d8',
        'on-secondary-container': '#8a4a1b',
        tertiary: '#9a6b14',
        'on-tertiary': '#fffcf5',
        'on-surface': '#1f1c17',
        'on-background': '#1f1c17',
        'on-surface-variant': '#605b51',
        'outline-variant': '#e3e0d8',
        'primary-fixed': '#e9e6df',
        mint: '#8fd6b4',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        headline: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0px 10px 30px rgba(31, 28, 23, 0.07)',
        'ambient-md': '0px 12px 34px rgba(31, 28, 23, 0.1)',
        'ambient-soft': '0px 10px 30px rgba(31, 28, 23, 0.04)',
      },
    },
  },
  plugins: [],
}

export default config
