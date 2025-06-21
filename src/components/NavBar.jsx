// src/components/NavBar.jsx
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  ArrowBackIos,
  Home as HomeIcon,
} from "@mui/icons-material";

export default function NavBar({ toggleTheme, mode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();

  // Hide NavBar on the Home page
  if (pathname === "/" || pathname === "/home") {
    return null;
  }

  // Shared button styles
  const linkButton = {
    color: theme.palette.common.white,
    textTransform: "none",
    fontWeight: 500,
    mx: 1,
    '&.active': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.text.primary,
      borderRadius: 1,
    },
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        backgroundColor: theme.palette.primary.main,
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Toolbar>
        {/* Back button */}
        <IconButton
          edge="start"
          onClick={() => navigate("/home")}
          sx={{ color: theme.palette.common.white, mr: 2 }}
        >
          <ArrowBackIos fontSize="small" />
        </IconButton>

        {/* Home button */}
        <IconButton
          onClick={() => navigate("/")}
          sx={{ color: theme.palette.common.white, mr: 3 }}
        >
          <HomeIcon />
        </IconButton>

        {/* Nav links */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
          <Button
            component={NavLink}
            to="/activities"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            פעילויות
          </Button>
          <Button
            component={NavLink}
            to="/flyers"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            פליירים
          </Button>
          <Button
            component={NavLink}
            to="/surveys"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            סקרים
          </Button>
          <Button
            component={NavLink}
            to="/messages"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            הודעות
          </Button>
          <Button
            component={NavLink}
            to="/HomepageImages"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            תמונות אווירה
          </Button>
          <Button
            component={NavLink}
            to="/manage-users"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            משתמשים
          </Button>
          <Button
            component={NavLink}
            to="/Data-analysis"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            ניתוח נתונים
          </Button>
          <Button
            component={NavLink}
            to="/contact-details"
            sx={linkButton}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            פרטי קשר
          </Button>
        </Box>

        {/* Spacer to push theme toggle right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Theme toggle */}
        <IconButton
          edge="end"
          onClick={toggleTheme}
          sx={{ color: theme.palette.common.white }}
        >
          {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
