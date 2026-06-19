/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          low: 'var(--color-surface-low)',
          DEFAULT: 'var(--color-surface-default)',
          high: 'var(--color-surface-high)',
          highest: 'var(--color-surface-highest)',
        },
        // Brand Colors
        primary: {
          DEFAULT: 'var(--color-primary-default)',
          container: 'var(--color-primary-container)',
        },
        secondary: 'var(--color-secondary)',
        tertiary: {
          DEFAULT: 'var(--color-tertiary-default)',
          container: 'var(--color-tertiary-container)',
        },
        error: 'var(--color-error)',
        // Text Colors
        onSurface: {
          DEFAULT: 'var(--color-on-surface-default)',
          variant: 'var(--color-on-surface-variant)',
        },
        outline: 'var(--color-outline)',
        
        // Custom Theme Colors
        primarySelectedText: 'var(--primary-selected-text)',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'var(--primary-gradient)',
        'primary-selected-item': 'var(--primary-selected-item)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}
