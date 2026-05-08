/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          base:     'var(--color-base)',
          surface:  'var(--color-surface)',
          card:     'var(--color-card)',
          elevated: 'var(--color-elevated)',
          text:     'var(--color-text)',
          muted:    'var(--color-muted)',
          border:   'var(--color-border)',
          accent:   'var(--color-accent)',
          brand:    'var(--color-brand)',
          'brand-fg': 'var(--color-brand-fg)',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('tailwindcss-animate'),
  ],
}

