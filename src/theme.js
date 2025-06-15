// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "#C29DD1",
      main:  "#7B1FA2",  // סגול כהה
      dark:  "#4A148C",
      contrastText: "#fff",
    },
    secondary: {
      light: "#FFE082",
      main:  "#FFD54F",  // צהוב־כתום
      dark:  "#FFA000",
      contrastText: "#000",
    },
    tertiary: {
      light: "#D1C4E9",
      main:  "#9575CD",  // סגול בהיר
      dark:  "#7E57C2",
      contrastText: "#fff",
    },
    success: {
      main: "#81C784",   // ירוק
      contrastText: "#fff",
    },
    warning: {
      main: "#FFB74D",   // כתום
      contrastText: "#000",
    },
    error: {
      main: "#E57373",   // אדום
      contrastText: "#fff",
    },
    background: { default: "#F3E5F5", paper: "#fff" },
    text:       { primary: "#2E1A47", secondary: "#5E3B76" },
  },
  // ... typography, components וכו׳
});

export default theme;
