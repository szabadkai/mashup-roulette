/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#06060A',
        surface: '#0F0F18',
        raised: '#191926',
        'raised-2': '#21213A',
        border: '#252548',
        'gold': { DEFAULT: '#FFB800', dim: '#7A5800', bright: '#FFD060', glow: 'rgba(255,184,0,0.35)' },
        'cyan': { DEFAULT: '#00CFFF', dim: '#004D7A', glow: 'rgba(0,207,255,0.35)' },
        cream: '#E8E4DC',
        muted: '#54547A',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['"Courier Prime"', 'monospace'],
      },
      keyframes: {
        'reel-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,184,0,0)' },
          '40%': { boxShadow: '0 0 40px 10px rgba(255,184,0,0.7)' },
          '70%': { boxShadow: '0 0 25px 5px rgba(255,184,0,0.4)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-gold': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'reel-glow': 'reel-glow 0.7s ease-in-out',
        'float': 'float 4s ease-in-out infinite',
        'toast-in': 'toast-in 0.2s ease-out',
        'scan-line': 'scan-line 8s linear infinite',
        'pulse-gold': 'pulse-gold 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}


