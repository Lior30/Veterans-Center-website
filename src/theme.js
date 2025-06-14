import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#91278F",
      light: "#d36dd5",
      dark: "#6c1f6d",
    },
    secondary: {
      main: "#F57C00",
      light: "#FFB74D",
      dark: "#EF6C00",
    },
    info: {
      main: "#673AB7",
    },
    success: {
      main: "#4CAF50",
    },
    warning: {
      main: "#FF9800",
    },
    error: {
      main: "#E53935",
    },
    background: {
      default: "#fdf5fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c2c2c",
      secondary: "#6d6d6d",
    },
  },
 typography: {
  fontFamily: `'Secular One', sans-serif`,
  h1: { fontWeight: 700, fontSize: "3rem", lineHeight: 1.3 },
  h2: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.3 },
  h3: { fontWeight: 700, fontSize: "2.2rem", lineHeight: 1.3 },
  h4: { fontWeight: 600, fontSize: "1.8rem" },
  h5: { fontWeight: 600, fontSize: "1.5rem" },
  h6: { fontWeight: 600, fontSize: "1.3rem" },
  body1: { fontSize: "1.2rem", lineHeight: 1.7, fontWeight: 400 }, // טקסט רגיל, לא בולד
  body2: { fontSize: "1.1rem", lineHeight: 1.6, fontWeight: 400 },
  button: { fontSize: "1.1rem", textTransform: "none", fontWeight: 400 }, // כפתור כן בולט
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
