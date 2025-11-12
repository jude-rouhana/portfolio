/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette as specified
        primary: {
          DEFAULT: '#ffffff', // White
          dark: '#f8f9fa', // Light gray
        },
        accent: {
          blue: '#1A2E5C', // Medium blue
          'sky-blue': '#15254A', // Dark blue
          gold: '#CBAC67', // Gold
          light: '#DBE3F5', // Light blue
          dark: '#0D1830', // Darkest blue
        },
        contrast: {
          DEFAULT: '#0D1830', // Darkest blue
          gray: '#15254A', // Dark blue
        }
      },
      fontFamily: {
        'sans': ['Figtree', 'Gidole', 'Inter', 'Poppins', 'Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        'display': ['Figtree', 'Gidole', 'Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        'gidole': ['Gidole', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        'figtree': ['Figtree', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 