import {
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    "div": {
      fontSize: 20,
    },
  },
  theme: {
    tokens: {
      colors: {
        black: {
          value: "#181818",
        },
        gray: {
          100: "#F4F4F4",
          200: "#E4E4E4",
          300: "#D4D4D4",
          400: "#A1A1A1",
          500: "#717171",
          600: "#525252",
          700: "#3F3F3F",
          800: "#282828",
          900: "#181818",
          950: "#0E0E0E",
        },
        purple: {
          50: "#EEF1FF",
          100: "#E0E4FF",
          200: "#C8CEFD",
          300: "#A6AEFB",
          400: "#8283F7",
          500: "#655CEB",
          600: "#5D47E3",
          700: "#503AC8",
          800: "#4231A2",
          900: "#392F80",
          950: "#221C4A",
        },
        red: {
          50: "#FEF3F2",
          100: "#FDE6E3",
          200: "#FCD1CC",
          300: "#F9B0A8",
          400: "#F48275",
          500: "#EC6C5E",
          600: "#D63D2C",
          700: "#B42F21",
          800: "#952B1F",
          900: "#7C2920",
          950: "#43110C",
        },
        teal: {
          50: "#F2FBF8",
          100: "#D4F3EA",
          200: "#A9E6D6",
          300: "#76D2BE",
          400: "#47B39F",
          500: "#309C8A",
          600: "#247D70",
          700: "#21645B",
          800: "#1E514A",
          900: "#1D443F",
          950: "#0B2825",
        },
        white: {
          DEFAULT: "#FFFFFF"
        },
        yellow: {
          50: "#FDF8ED",
          100: "#FAEBCB",
          200: "#F4D793",
          300: "#EEBC59",
          400: "#EAA635",
          500: "#E3851D",
          600: "#BE5D13",
          700: "#A74616",
          800: "#883818",
          900: "#702E17",
          950: "#401608",
        },
      },
    },
  },
})


export const system = createSystem(defaultConfig, config)