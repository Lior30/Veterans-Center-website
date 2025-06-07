import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#91278F",       // סגול כהה - צבע עיקרי
      light: "#d36dd5",      // סגול בהיר
      dark: "#6c1f6d",       // סגול כהה יותר
    },
    secondary: {
      main: "#F57C00",       // כתום חם - ניגוד חזק ונגיש
      light: "#FFB74D",      // כתום בהיר
      dark: "#EF6C00",       // כתום כהה
    },
    info: {
      main: "#673AB7",       // אינדיקציות / אזכורים
    },
    success: {
      main: "#4CAF50",       // ירוק להודעות הצלחה
    },
    warning: {
      main: "#FF9800",       // כתום להודעות אזהרה
    },
    error: {
      main: "#E53935",       // אדום להודעות שגיאה
    },
    background: {
      default: "#fdf5fc",    // רקע בהיר עם נגיעה סגולה
      paper: "#ffffff",
    },
    text: {
      primary: "#2c2c2c",
      secondary: "#6d6d6d",
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
