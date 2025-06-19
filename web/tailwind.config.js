const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './new-components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        theme: {
          primary: '#000000',
          secondary: '#6B7280',
          light: '#FFFFFF',
          dark: '#111827',
          'dark-container': '#1F2937',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
        gradientL: '#000000',
        gradientR: '#374151',
      },
      backgroundColor: {
        bar: '#F9FAFB',
        'bar-dark': '#111827',
      },
      textColor: {
        default: '#000000',
        'default-dark': '#FFFFFF',
      },
      backgroundImage: {
        'gradient-light': "url('/images/bg.png')",
        'gradient-dark': 'url("/images/bg_dark.png")',
        'button-gradient': 'linear-gradient(to right, theme("colors.gradientL"), theme("colors.gradientR"))',
      },
      keyframes: {
        pulse1: {
          '0%, 100%': { transform: 'scale(1)', backgroundColor: '#9CA3AF' },
          '33.333%': { transform: 'scale(1.5)', backgroundColor: '#374151' },
        },
        pulse2: {
          '0%, 100%': { transform: 'scale(1)', backgroundColor: '#9CA3AF' },
          '33.333%': { transform: 'scale(1.0)', backgroundColor: '#9CA3AF' },
          '66.666%': { transform: 'scale(1.5)', backgroundColor: '#374151' },
        },
        pulse3: {
          '0%, 66.666%': { transform: 'scale(1)', backgroundColor: '#9CA3AF' },
          '100%': { transform: 'scale(1.5)', backgroundColor: '#374151' },
        },
      },
      animation: {
        pulse1: 'pulse1 1.2s infinite',
        pulse2: 'pulse2 1.2s infinite',
        pulse3: 'pulse3 1.2s infinite',
      },
    },
  },
  important: true,
  darkMode: 'class',
  /**
   * @see https://www.tailwindcss-animated.com/configurator.html
   */
  plugins: [require('tailwindcss-animated')],
};
