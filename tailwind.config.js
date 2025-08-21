/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        sideways: "sideways 3s linear infinite",
        slideLeft: "slideLeft 30s linear infinite",
        slideLeft2: "slideLeft 20s linear infinite",
        slideLeft3: "slideLeft 10s linear infinite",
        slideLeftResponsive: "slideLeftResponsive 30s linear infinite",
        like: "like 0.2s alternate 2",
        deleteLike: "deleteLike 0.2s alternate 2",
        fadeIn: "fadeIn 2s linear",
        menuProfileFadeIn: "fadeIn 0.3s linear",
        fadeOut: "fadeOut 1.5s linear",
        tilt: "tilt 10s infinite linear",
        moveRight: "moveRight 0.5s infinite alternate",
        menuRight: "menuRight 0.5s linear",
        menuLeft: "menuLeft 0.5s linear",
        hoverUp: "hoverUp 0.05s linear",
        hoverDown: "hoverDown 0.07s linear",
        expandVertical: "expandVertical 0.5s forwards",
        shrinkVertical: "shrinkVertical 0.5s forwards",
      },
      keyframes: {
        expandVertical: {
          "0%": {
            height: "30%",
          },
          "100%": {
            height: "100%",
          },
        },
        shrinkVertical: {
          "0%": {
            height: "100%",
          },
          "100%": {
            height: "30%",
          },
        },
        moveRight: {
          "0%": {
            opacity: "0.25",
            transform: "scale(1)",
          },
          "25%": {
            opacity: "0.25",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.50",
            transform: "scale(1)",
          },
          "75%": {
            opacity: "1",
            transform: "scale(1.01)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1.01)",
          },
        },
        tilt: {
          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(2deg)",
          },
          "75%": {
            transform: "rotate(-2deg)",
          },
        },
        hoverDown: {
          "0%": {
            transform: "translateY(0px)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
        },
        hoverUp: {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0px)",
            opacity: "1",
          },
        },
        sideways: {
          "0%, 100%": {
            left: "0",
            top: "0",
          },
          "50%": {
            left: "100px",
            top: "0",
          },
        },
        menuLeft: {
          "0%, 100%": {
            transform: "translateX(0%)",
          },
        },
        menuRight: {
          "0%, 100%": {
            transform: "translateX(100%)",
          },
        },
        deleteLike: {
          "0%": {
            transform: "scale(1.5)",
            opacity: "0.1",
          },
          "50%": {
            transform: "scale(1)",
            opacity: "0.60",
          },
          "100%": {
            transform: "scale(0.50)",
            opacity: "0.30",
          },
        },
        like: {
          "0%": {
            transform: "scale(0.50)",
            opacity: "0.30",
          },
          "50%": {
            transform: "scale(1)",
            opacity: "0.60",
          },
          "100%": {
            transform: "scale(1.5)",
            opacity: "1",
          },
        },
        slideLeft: {
          "0%": {
            transform: "translateX(100%)",
          },
          "30%": {
            transform: "translateX(0%)",
          },
          "85%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        slideLeftResponsive: {
          "0%": {
            transform: "translateX(100%)",
            "white-space": "nowrap",
          },
          "100%": {
            transform: "translateX(-1350%)",
            "white-space": "no-wrap",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "20%": {
            opacity: "0.20",
          },
          "50%": {
            opacity: "0.50",
          },
          "70%": {
            opacity: "0.70",
          },
          "100%": {
            opacity: "1",
          },
        },
        fadeOut: {
          "0%": {
            opacity: "1",
          },
          "20%": {
            opacity: "0.80",
          },
          "50%": {
            opacity: "0.50",
          },
          "70%": {
            opacity: "0.20",
          },
          "100%": {
            opacity: "0",
          },
        },
      },
      backgroundImage: {
        primaryColor: {
          toR: "var(--primary-color)",
          toB: "var(--primary-color-variant-toB)",
        },
      },
      colors: {
        orange: {
          300: "#FFC299",
          400: "#FF9147",
          500: "#FF8533",
        },
        blue: {
          300: "#ADDCFF",
          400: "#62B7F8",
          500: "#008BF5",
        },
        white: {
          200: "#FFFFFF",
          300: "#F5F5F5",
          400: "#E0E0E0",
          500: "#CCCCCC",
        },
        black: {
          200: "#5C5C5C",
          300: "#333333",
          400: "#1F1F1F",
          500: "#141414",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        Poppins: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": 'url("./public/index/headerBackground.mp4")',
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  variants: {
    extend: {
      letterSpacing: ["hover, focus"],
      transitionProperty: ["responsive", "motion-safe", "motion-reduce"],
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-motion")],
};
