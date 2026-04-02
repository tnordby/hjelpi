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
        background: '#f8f9ff',
        surface: '#f8f9ff',
        'surface-bright': '#f8f9ff',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#d3e4fe',
        'surface-dim': '#cbdbf5',
        primary: '#00606c',
        'on-primary': '#ffffff',
        'primary-container': '#007b8a',
        'on-primary-container': '#ddf9ff',
        secondary: '#29657a',
        'on-secondary': '#ffffff',
        'secondary-container': '#ace5fe',
        'on-secondary-container': '#2c687d',
        tertiary: '#745100',
        'on-tertiary': '#ffffff',
        'on-surface': '#0b1c30',
        'on-background': '#0b1c30',
        'on-surface-variant': '#3e494b',
        'outline-variant': '#bdc8cb',
        'primary-fixed': '#9defff',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        headline: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0px 10px 30px rgba(11, 28, 48, 0.05)',
        'ambient-md': '0px 10px 30px rgba(11, 28, 48, 0.08)',
        'ambient-soft': '0px 10px 30px rgba(11, 28, 48, 0.03)',
      },
    },
  },
  plugins: [],
}

export default config
