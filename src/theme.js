// src/theme.js
import { createTheme } from "@mui/material/styles";

/**
 * מחזיר theme בהתאם ל־mode ("light" או "dark")
 */
export function getDesignTheme(mode) {
  return createTheme({
    direction: "rtl",
    palette: {
      mode,

      // צבע ראשי פסטלי–עמוק (Purple Haze)
      primary: {
        light: "#A692CC",
        main:  "#6B5B95",
        dark:  "#503A78",
        contrastText: "#FFFFFF",
      },

      // צבע משני עדין (Sage Green)
      secondary: {
        light: "#B9C9A6",
        main:  "#88B04B",
        dark:  "#618238",
        contrastText: "#FFFFFF",
      },

      // צבע טאצ' חמים (Coral Blush)
      tertiary: {
        light: "#F8B6A4",
        main:  "#E27D60",
        dark:  "#B94D3D",
        contrastText: "#FFFFFF",
      },

      info: {
        main: "#5DAE8B",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#82C0CC",
        contrastText: "#2E1A47",
      },
      warning: {
        main: "#FFB400",
        contrastText: "#2E1A47",
      },
      error: {
        main: "#E15759",
        contrastText: "#FFFFFF",
      },

      background: mode === "dark"
        ? { default: "#2E1A47", paper: "#3E2A5A" }
        : { default: "#F4F2F7", paper: "#FFFFFF" },

      text: mode === "dark"
        ? { primary: "#FFFFFF", secondary: "#CCCCCC" }
        : { primary: "#2E1A47", secondary: "#6B5B95" },
    },

    typography: {
      // פונט מודרני וקריא
      fontFamily: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
      h1: { fontWeight: 600, fontSize: "3rem", lineHeight: 1.2 },
      h2: { fontWeight: 600, fontSize: "2.5rem", lineHeight: 1.25 },
      h3: { fontWeight: 500, fontSize: "2rem", lineHeight: 1.3 },
      h4: { fontWeight: 500, fontSize: "1.6rem" },
      h5: { fontWeight: 500, fontSize: "1.3rem" },
      h6: { fontWeight: 500, fontSize: "1.1rem" },
      body1: { fontSize: "1.1rem", lineHeight: 1.6, fontWeight: 400 },
      body2: { fontSize: "1rem", lineHeight: 1.5, fontWeight: 400 },
      button: { fontSize: "1rem", textTransform: "none", fontWeight: 500 },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "10px 28px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          },
        },
      },
    },
  });
}
