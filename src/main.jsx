
// src/main.jsx
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getDesignTheme } from "./theme.js";
import App from "./App.jsx";
import "./index.css";

function Root() {
  // מצב התצוגה: light או dark
  const [mode, setMode] = useState("light");

  // Toggle בין המצבים
  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // בונים את ה-theme לפי המצב הנוכחי
  const theme = getDesignTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* מעבירים את toggleTheme וה־mode ל־App */}
        <App toggleTheme={toggleTheme} mode={mode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);