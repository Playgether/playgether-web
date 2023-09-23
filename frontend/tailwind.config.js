/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        sideways: "sideways 3s linear infinite",
        slideLeft: 'slideLeft 30s linear infinite',
        like: 'like 0.2s alternate 2',
        deleteLike: "deleteLike 0.2s alternate 2",
        fadeIn: 'fadeIn 2s linear',
        fadeOut: 'fadeOut 1.5s linear',
      },
      keyframes: {
        sideways: {
          "0%, 100%": { left: "0", top: "0" },
          "50%": { left: "100px", top: "0" },
        },

        deleteLike: {
          "0%": {transform: 'scale(1.5)', opacity: 0.1},
          "50%": {transform: 'scale(1)', opacity: 0.60},
          "100%": {transform: 'scale(0.50)', opacity: 0.30},
        },

        like: {
          "0%": {transform: 'scale(0.50)', opacity: 0.30},
          "50%": {transform: 'scale(1)', opacity: 0.60},
          "100%": {transform: 'scale(1.5)', opacity: 1},
        },

        slideLeft: {
          '0%': { transform: 'translateX(100%)'},
          "90%": {opacity: 0.90},
          "95%": {opacity: 0.60},
          "99%": {opacity: 0.10},
          '100%': { transform: 'translateX(-100%)', opacity: 0},
        },

        fadeIn: {
          '0%': { opacity: 0},
          "20%": {opacity: 0.20},
          "50%": {opacity: 0.50},
          "70%": {opacity: 0.70},
          "100%": {opacity: 1},
        },

        fadeOut: {
          '0%': { opacity: 1},
          "20%": {opacity: 0.80},
          "50%": {opacity: 0.50},
          "70%": {opacity: 0.20},
          "100%": {opacity: 0},
        }
      },
      
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
        },

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

