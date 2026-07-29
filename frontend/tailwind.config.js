/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        void: '#000000',
        phosphor: {
          DEFAULT: '#17E88F',
          soft: '#8FF7CE',
          deep: '#0B3B2E',
        },
        line: {
          light: 'rgba(0,0,0,0.10)',
          dark: 'rgba(255,255,255,0.12)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(23,232,143,0.55)' },
          '70%': { boxShadow: '0 0 0 8px rgba(23,232,143,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(23,232,143,0)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-1%,-2%)' },
          '30%': { transform: 'translate(2%,1%)' },
          '50%': { transform: 'translate(-2%,2%)' },
          '70%': { transform: 'translate(1%,-1%)' },
          '90%': { transform: 'translate(-1%,1%)' },
        },
      },
      animation: {
        blink: 'blink 1.6s ease-in-out infinite',
        pulseRing: 'pulseRing 2s ease-out infinite',
        rise: 'rise 0.32s cubic-bezier(.2,.7,.3,1) both',
        grain: 'grain 8s steps(8) infinite',
      },
    },
  },
  plugins: [],
}
