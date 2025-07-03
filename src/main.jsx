import { CssBaseline, ThemeProvider } from "@mui/material";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from './context/AuthProvider.jsx';
import "./index.css";
import { getDesignTheme } from "./theme.js";

function Root() {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = getDesignTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App toggleTheme={toggleTheme} mode={mode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
