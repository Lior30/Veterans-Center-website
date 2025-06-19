// src/components/LandingNavBar.jsx
import React, { useState, useEffect } from "react";
import { Box, IconButton, Button, useTheme } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessibilityWidget from "./AccessibilityWidget";

export default function LandingNavBar({
  onScrollToFlyers,
  onScrollToMessages,
  onScrollToActivities,
  onScrollToSurveys,
}) {
  const theme = useTheme();
  const purple = theme.palette.primary.main;
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      component="nav"
      dir="ltr"
      sx={{
        position: isSticky ? "fixed" : "static",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: theme.zIndex.appBar,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
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
          sx={{ color: purple }}
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          component="a"
          href="https://wa.me/0523705021"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: purple }}
        >
          <WhatsAppIcon />
        </IconButton>
        <IconButton component="a" href="tel:0523705021" sx={{ color: purple }}>
          <PhoneIcon />
        </IconButton>
      </Box>

      {/* אמצע: כפתורי ניווט (הסדר הפוך אך לא הורד שום דבר) */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <Button
          onClick={onScrollToSurveys}
          sx={{ color: purple, textTransform: "none" }}
        >
          סקרים
        </Button>
        <Button
          onClick={onScrollToActivities}
          sx={{ color: purple, textTransform: "none" }}
        >
          פעילויות
        </Button>
        <Button
          onClick={onScrollToMessages}
          sx={{ color: purple, textTransform: "none" }}
        >
          הודעות
        </Button>
        <Button
          onClick={onScrollToFlyers}
          sx={{ color: purple, textTransform: "none" }}
        >
          פליירים
        </Button>
      </Box>

      {/* ימין: לוגו + כפתור נגישות */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          component="img"
          src="/logo.jpeg"
          alt="Logo"
          sx={{ height: 40, cursor: "pointer" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <AccessibilityWidget />
      </Box>
    </Box>
  );
}
