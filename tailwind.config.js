/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Backgrounds
        background: '#091421',
        surface: {
          low: '#121C2A',
          DEFAULT: '#16202E',
          high: '#212B39',
          highest: '#2B3544',
        },
        // Brand Colors
        primary: {
          DEFAULT: '#ADC6FF',
          container: '#4D8EFF',
        },
        secondary: '#B1C6F9',
        tertiary: {
          DEFAULT: '#FFB786',
          container: '#DF7412',
        },
        error: '#FFB4AB',
        // Text Colors
        onSurface: {
          DEFAULT: '#D9E3F6',
          variant: '#C2C6D6',
        },
        outline: '#8C909F',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}
