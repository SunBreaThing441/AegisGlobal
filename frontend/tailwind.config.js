/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Deep Space Navy surfaces
        space: {
          950: '#050814',
          900: '#0A0F24', // Deep Space Navy primary
          850: '#0E142E',
          800: '#121936', // Secondary Navy surface
          700: '#1B2446',
          600: '#28355E',
          500: '#3D4C7F',
        },
        // UNESCO Azure & Deep Cyan
        unesco: {
          azure: '#0077D4', // UNESCO Azure
          cyan: '#00F0FF',  // Deep Cyber Cyan
          blue: '#0055A5',
          deep: '#003366',
          glow: '#00F0FF',
        },
        // Bio-Emerald, Neon Amber & Emergency Accents
        accent: {
          emerald: '#10B981', // Bio-Emerald Green
          amber: '#F59E0B',   // Neon Amber for SLA/Warning
          rose: '#F43F5E',    // Neon Red for Emergency SOS
          DEFAULT: '#F59E0B',
        },
        neon: {
          cyan: '#00F0FF',
          azure: '#0077D4',
          emerald: '#10B981',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#F43F5E',
          purple: '#A855F7',
          blue: '#0077D4',
        },
        primary: {
          DEFAULT: '#0077D4',
          light: '#00F0FF',
          dark: '#0055A5',
        },
        secondary: {
          DEFAULT: '#121936',
          dark: '#0A0F24',
          light: '#1B2446',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 3.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'emergency-pulse': 'emergency-pulse 1.4s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'border-glow': 'border-glow 2.5s ease-in-out infinite',
        'horizon-scan': 'horizon-scan 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'emergency-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.45)' },
          '50%': { boxShadow: '0 0 0 14px rgba(244, 63, 94, 0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.2)' },
          '50%': { borderColor: 'rgba(0, 240, 255, 0.65)' },
        },
        'horizon-scan': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
        panel: '28px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glow-azure': '0 0 25px rgba(0, 119, 212, 0.35), 0 0 60px rgba(0, 119, 212, 0.15)',
        'glow-cyan': '0 0 25px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.15)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35), 0 0 60px rgba(16, 185, 129, 0.15)',
        'glow-amber': '0 0 25px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.15)',
        'glow-emergency': '0 0 30px rgba(244, 63, 94, 0.45), 0 0 70px rgba(244, 63, 94, 0.18)',
        'metallic-card': '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 12px 32px -8px rgba(0, 0, 0, 0.5)',
        'unesco-glass': '0 8px 32px 0 rgba(0, 119, 212, 0.12)',
        'inner-glow': 'inset 0 0 24px rgba(0, 240, 255, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
}
