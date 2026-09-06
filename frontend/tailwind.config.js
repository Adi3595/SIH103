/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Scoutie Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#264653',
          light: '#365b6b',
        },
        teal: {
          DEFAULT: '#2a9d8f',
          light: '#35b5a6',
        },
        yellow: {
          DEFAULT: '#e9c46a',
        },
        orange: {
          DEFAULT: '#f4a261',
        },
        coral: {
          DEFAULT: '#e76f51',
        },
        background: 'var(--background)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text-main)',
        muted: 'var(--text-muted)',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(38, 70, 83, 0.05)',
        'elevated': '0 8px 30px -4px rgba(38, 70, 83, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
