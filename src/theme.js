// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#004080",   // כחול כהה
      light: "#336699",
      dark: "#00264d",
    },
    secondary: {
      main: "#e68a00",   // כתום חם
      light: "#ffb84d",
      dark: "#b36100",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: `"Segoe UI", Tahoma, "Helvetica Neue", Arial, sans-serif`,
    h3: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2 },
    h5: { fontWeight: 500, fontSize: "1.5rem" },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600 },
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

export default theme;
