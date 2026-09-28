/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        automotive: {
          background: '#050608',
          card: '#0E1116',
          border: '#1B2635',
          blue: '#00C8FF', // Primary Accent
          green: '#3DFF53', // Success
          warning: '#FFC107',
          danger: '#FF5252',
          muted: '#A1A8B3',
          white: '#FFFFFF',
          // Keep legacy aliases that components might currently use so we don't break everything instantly
          dark: '#0E1116',
          gray: '#A1A8B3', 
          black: '#050608',
        }
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'], // Specifically for speed, GPS, HUD
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      spacing: {
        'page': '32px',
        'card': '20px',
        'grid-gap': '24px',
        'section-gap': '40px',
      },
      borderRadius: {
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
