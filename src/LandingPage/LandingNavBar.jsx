// src/components/LandingNavBar.jsx
import React, { useState, useEffect } from "react";
import { Box, IconButton, Button, useTheme } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";

export default function LandingNavBar({
  onScrollToActivities,
  onScrollToFlyers,
  onScrollToSurveys,
  onScrollToMessages,
}) {
  const theme = useTheme();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
  component="nav"
  sx={{
    position: isSticky ? "fixed" : "static",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: theme.zIndex.appBar,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: theme.palette.primary.main,
    p: 1,
  }}
>
  {/* שמאל: אייקונים חברתיים */}
  <Box sx={{ display: "flex", gap: 1 }}>
    <IconButton
      component="a"
      href="https://www.facebook.com"
      target="_blank"
      rel="noopener noreferrer"
      sx={{ color: "#fff" }}
    >
      <FacebookIcon />
    </IconButton>
    <IconButton
      component="a"
      href="https://wa.me/0523705021"
      target="_blank"
      rel="noopener noreferrer"
      sx={{ color: "#fff" }}
    >
      <WhatsAppIcon />
    </IconButton>
    <IconButton component="a" href="tel:0523705021" sx={{ color: "#fff" }}>
      <PhoneIcon />
    </IconButton>
  </Box>

  {/* מרכז: כפתורי ניווט */}
  <Box
    sx={{
      display: "flex",
      gap: 2,
      justifyContent: "center",
      flexGrow: 1,
    }}
  >
    <Button onClick={onScrollToActivities} sx={{ color: "#fff", textTransform: "none" }}>
      פעילויות
    </Button>
    <Button onClick={onScrollToFlyers} sx={{ color: "#fff", textTransform: "none" }}>
      פליירים
    </Button>
    <Button onClick={onScrollToSurveys} sx={{ color: "#fff", textTransform: "none" }}>
      סקרים
    </Button>
    <Button onClick={onScrollToMessages} sx={{ color: "#fff", textTransform: "none" }}>
      הודעות
    </Button>
  </Box>

  {/* ימין: לראש הדף */}
  <Box>
    {isSticky && (
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          color: "#fff",
          textTransform: "none",
          backgroundColor: theme.palette.secondary.main,
          ml: 2,
          "&:hover": { backgroundColor: theme.palette.secondary.dark },
        }}
      >
        לראש הדף
      </Button>
    )}
  </Box>
</Box>

  );
}
