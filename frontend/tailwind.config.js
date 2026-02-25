/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0a0a0f',
          surface: '#12121a',
          border: '#1e1e2e',
          muted: '#2a2a3e',
        },
        neon: {
          green: '#00ff9f',
          cyan: '#00d4ff',
          purple: '#b06aff',
          pink: '#ff6ad4',
        },
        waveform: {
          low: '#00ff9f',
          mid: '#00d4ff',
          high: '#ff6ad4',
        }
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(30, 30, 46, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 30, 46, 0.5) 1px, transparent 1px)',
        'glow-green': 'radial-gradient(ellipse at center, rgba(0, 255, 159, 0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wave': 'wave 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
