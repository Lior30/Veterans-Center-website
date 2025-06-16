// src/theme.js
import { createTheme } from "@mui/material/styles";

/**
 * מחזיר theme בהתאם ל־mode ("light" או "dark")
 */
export function getDesignTheme(mode) {
  return createTheme({
    direction: "rtl",
    palette: {
      mode, // "light" או "dark"

      primary: {
        light: "#B39DDB",
        main:  "#7E57C2",
        dark:  "#5E35B1",
        contrastText: "#FFFFFF",
      },
      secondary: {
        light: "#FFCC80",
        main:  "#FFB74D",
        dark:  "#F57C00",
        contrastText: "#000000",
      },
      tertiary: {
        light: "#E1BEE7",
        main:  "#CE93D8",
        dark:  "#AB47BC",
        contrastText: "#FFFFFF",
      },
      info: {
        main: "#4FC3F7",
        contrastText: "#000000",
      },
      success: {
        main: "#81C784",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: "#FFD54F",
        contrastText: "#000000",
      },
      error: {
        main: "#E57373",
        contrastText: "#FFFFFF",
      },

      background: mode === "dark"
        ? { default: "#121212", paper: "#1e1e1e" }
        : { default: "#F9F4FF", paper: "#FFFFFF" },

      text: mode === "dark"
        ? { primary: "#FFFFFF", secondary: "#CCCCCC" }
        : { primary: "#2E1A47", secondary: "#5E3B76" },
    },
    typography: {
      fontFamily: `'Secular One', sans-serif`,
      h1: { fontWeight: 400, fontSize: "3rem", lineHeight: 1.3 },
      h2: { fontWeight: 400, fontSize: "2.5rem", lineHeight: 1.3 },
      h3: { fontWeight: 400, fontSize: "2.2rem", lineHeight: 1.3 },
      h4: { fontWeight: 400, fontSize: "1.8rem" },
      h5: { fontWeight: 400, fontSize: "1.5rem" },
      h6: { fontWeight: 400, fontSize: "1.3rem" },
      body1: { fontSize: "1.2rem", lineHeight: 1.7, fontWeight: 400 },
      body2: { fontSize: "1.1rem", lineHeight: 1.6, fontWeight: 400 },
      button: { fontSize: "1.1rem", textTransform: "none", fontWeight: 400 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 24px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });
}
