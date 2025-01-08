/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          primary: '#00ff9f',     // Neon Green
          secondary: '#0066ff',   // Bright Blue
          accent: '#ff0055',      // Pink
          dark: '#0a0a1f',        // Deep Space
          darker: '#050510',      // Darker Space
          light: '#e6f1ff',       // Star Light
          gray: '#404060',        // Space Gray
          success: '#00ff9f',     // Mission Success
          warning: '#ffaa00',     // Warning
          danger: '#ff0055',      // Critical
          'grid': '#1a1a3a',      // Grid Lines
        }
      },
      fontFamily: {
        'space': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 4px #00ff9f' },
          '100%': { textShadow: '0 0 8px #00ff9f, 0 0 12px #00ff9f' }
        },
        scan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(circle at center, #0a0a1f 0%, #050510 100%)',
        'grid-pattern': 'linear-gradient(to right, #1a1a3a 1px, transparent 1px), linear-gradient(to bottom, #1a1a3a 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
