/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bottle: {
          950: '#061713',
          900: '#0A2923', // darker shade from requirements
          800: '#123C32', // primary deep bottle green
          700: '#1B5446',
          600: '#267360',
          500: '#34937B',
          400: '#4DB59B',
          300: '#7ACBBC',
          200: '#ACE1D7',
          100: '#D5F1EC',
          50: '#EDFAF7',
        },
        bone: {
          900: '#C8BAA5',
          800: '#D9CCB8',
          700: '#E4D8C5',
          600: '#E9DFCF', // alternative secondary
          500: '#F3EBDD', // secondary warm ivory
          400: '#F7F1E7',
          300: '#FAF6EF',
          200: '#FCF9F4',
          100: '#FEFCF9',
          50: '#FFFFFF',
        },
        crimson: {
          950: '#4D121B',
          900: '#681A25',
          800: '#8F2938', // alternative accent
          700: '#A3313D', // primary accent vermilion / crimson
          600: '#BF3F4D',
          500: '#D95361',
          400: '#EA7985',
          300: '#F4A4AD',
          200: '#FACED3',
          100: '#FDE9EB',
          50: '#FFF5F6',
        },
        gold: {
          500: '#D4AF37',
          400: '#E5C158',
          300: '#F3D98A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(18, 60, 50, 0.05), 0 1px 2px rgba(18, 60, 50, 0.03)',
        'premium': '0 10px 25px -5px rgba(18, 60, 50, 0.08), 0 8px 10px -6px rgba(18, 60, 50, 0.04)',
        'elevated': '0 20px 35px -10px rgba(18, 60, 50, 0.12), 0 10px 15px -5px rgba(18, 60, 50, 0.06)',
      }
    },
  },
  plugins: [],
}
