/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {

      colors: {
        orange: {
          300:"#FFC299",
          400:"#FF9147",
          500:"#FF8533"
        },
        blue: {
          300:"#ADDCFF",
          400:"#62B7F8",
          500:"#008BF5"
        },
        white: {
          200: "#FFFFFF",
          300: "#F5F5F5",
          400: "#E0E0E0",
          500:"#CCCCCC"
        },
        black: {
          200: "#5C5C5C",
          300: "#333333",
          400: "#1F1F1F",
          500: "#141414"
        }
      },

      fontFamily: {
        'Poppins': ['Poppins', 'sans-serif']
      },

      backgroundImage: {
        'hero-pattern': "url('./public/index/headerBackground.mp4')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  variants: {
    extend: {
      letterSpacing: ['hover, focus'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce']
    }
  },
  plugins: [],
}
