/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand Colors from ConSync Brand Guide
        primary: {
          DEFAULT: '#1E4E8C', // Blueprint Blue
          light: '#3C6BA8',
          lighter: '#5A88C4',
          lightest: '#E6EFFD',
          dark: '#042861',
        },
        steel: {
          DEFAULT: '#2C2F33', // Steel Grey
          light: '#4A4D51',
          dark: '#1A1C1E', // Graphite Black
        },
        concrete: {
          DEFAULT: '#F5F6F7', // Concrete White
          dark: '#E8EAED',
        },
        growth: {
          DEFAULT: '#4CAF50', // Growth Green
          light: '#66BB6A',
          dark: '#388E3C',
        },
        signal: {
          DEFAULT: '#F9C74F', // Signal Yellow
          light: '#FFD666',
          dark: '#F4A10C',
        },
        cloud: {
          DEFAULT: '#D1D5DB', // Cloud Grey
          light: '#E5E7EB',
          dark: '#9CA3AF',
        },
        accent: {
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};