// src/theme.js
import { createTheme } from "@mui/material/styles";

/**
 * "Purple Calm" design system  ✨  v2.4
 * -------------------------------------------------------------
 *  » Logo‑purple primary (‎#9B3FAF)
 *  » Soft complementary lilac secondary
 *  » Blue & yellow **replaced** by gentle purple hues for better harmony
 *  » 8 px radius – logo never clipped
 * -------------------------------------------------------------
 */
export function getDesignTheme(mode = "light") {
  const dark = mode === "dark";

  /* ---------- Logo‑purple scale ---------- */
  const logo = {
    50:  "#F6EFFB",
    100: "#EAD9F5",
    200: "#D5B2EB",
    300: "#C08BE1",
    400: "#AB63D7",
    500: "#9B3FAF",   // main (sampled from logo)
    600: "#842F93",   // dark
    700: "#6A2576",
    contrastText: "#FFFFFF",
  };

  const lilac = {
    100: "#F0E6FA",
    300: "#D8C6F0",
    500: "#BFA5D2",   
    600: "#9678A6",   
  };

  const surface     = dark ? "#20182A" : "#FFFFFF";
  const background  = dark ? "#14101B" : "#F8F6FA";
  const outline     = dark ? "#50485F" : "#D5D0E5";

  return createTheme({
    direction: "rtl",

    palette: {
      mode,
      primary: {
        light: logo[300],
        main:  logo[500],
        dark:  logo[600],
        
        vlight: logo[50],
        
        lightblue: "#E0FFFF",
        contrastText: logo.contrastText,
      },
      secondary: {
        light: lilac[300],
        main:  lilac[500],
        dark:  lilac[600],
        contrastText: "#FFFFFF",
      },

      /* Status colours tuned to muted purples  */
      info:    { main: lilac[500], contrastText: "#FFFFFF" },   
      warning: { main: lilac[600], contrastText: "#FFFFFF" },   
      error:   { main: "#D77A94", contrastText: "#FFFFFF" },   
      success: { main: "#7CBF9E", contrastText: "#FFFFFF" },

      background: { default: background, paper: surface },
      text: {
        primary: dark ? "#FFFFFF" : "#1C1430",
        secondary: dark ? "#D4CFE6" : "#6E6893",
      },
      custom: { outline, surfaceVariant: dark ? "#29223C" : "#F0EDF8" },
    },

    /* Typography  */
    typography: {
fontFamily: "'Rubik', 'Arial', sans-serif",
      h1: { fontWeight: 600, fontSize: "clamp(2.6rem, 6vw, 3.2rem)", lineHeight: 1.15 },
      h2: { fontWeight: 600, fontSize: "clamp(2.1rem, 5vw, 2.7rem)", lineHeight: 1.2 },
      h3: { fontWeight: 500, fontSize: "clamp(1.7rem, 4vw, 2.2rem)", lineHeight: 1.25 },
      h4: { fontWeight: 500, fontSize: "1.55rem" },
      h5: { fontWeight: 500, fontSize: "1.25rem" },
      h6: { fontWeight: 500, fontSize: "1.05rem" },
      body1:{ fontSize: "1.04rem", lineHeight: 1.6 },
      body2:{ fontSize: "0.95rem", lineHeight: 1.55 },
      button:{ fontWeight: 600, textTransform: "none" },
    },

    /* Shape & Shadows  */
    shape: { borderRadius: 8 },

    shadows: Array.from({ length: 25 }, (_, i) =>
      i === 0 ? "none" : `0 ${i * 0.3}px ${(i + 1)}px rgba(0,0,0,0.${Math.min(10 + i, 28) / 100})`
    ),

    /*  Components  */
    components: {
      MuiCssBaseline: { styleOverrides: { body: { backgroundColor: background } } },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            paddingInline: 24,
            paddingBlock: 10,
            fontWeight: 600,
            transition: "all 150ms",
          },
          containedPrimary:{
            backgroundColor: logo[500],
            "&:hover": { backgroundColor: logo[600] },
          },
          containedInfo:{
            backgroundColor: lilac[500],
            "&:hover": { backgroundColor: lilac[600] },
          },
          containedWarning:{
            backgroundColor: lilac[600],
            "&:hover": { backgroundColor: lilac[700] },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12, boxShadow: "0 3px 10px rgba(0,0,0,0.05)" },
        },
      },

      MuiTextField: {
        defaultProps: { variant: "outlined" },
        styleOverrides: {
          root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } },
        },
      },
    },
  });
}
