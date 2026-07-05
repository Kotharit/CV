import type { Config } from 'tailwindcss';

/**
 * Theme shifting works through CSS variables: every theme sets its own
 * palette on `html[data-theme='…']` (see app/globals.css), and Tailwind
 * utilities below resolve against those variables at runtime.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './themes/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
          panel: 'var(--panel)',
          border: 'var(--border)',
          fg: 'rgb(var(--fg-rgb) / <alpha-value>)',
          muted: 'var(--fg-muted)',
          accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
          accent2: 'rgb(var(--accent-2-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      spacing: {
        nav: 'var(--nav-h)',
      },
      zIndex: {
        nav: '50',
        modal: '60',
        overlay: '70',
      },
    },
  },
  plugins: [],
};

export default config;
