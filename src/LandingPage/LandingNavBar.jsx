// src/components/LandingNavBar.jsx
import React, { useState, useEffect } from "react";
import { Box, IconButton, Button, useTheme } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessibilityWidget from "./AccessibilityWidget";
import ContactService from "../services/ContactService";

export default function LandingNavBar({
  onScrollToFlyers,
  onScrollToMessages,
  onScrollToActivities,
  onScrollToSurveys,
}) {
  const theme = useTheme();
  const purple = theme.palette.primary.main;

  /* מצב sticky */
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* פרטי קשר */
  const [contact, setContact] = useState({ contactPhone: "", contactWhatsapp: "" });
  useEffect(() => {
    ContactService.get().then((d) =>
      setContact({
        contactPhone: d.contactPhone ?? "",
        contactWhatsapp: d.contactWhatsapp ?? "",
      })
    );
  }, []);

  return (
    <>
      {/* ─────  הסרגל העליון  ───── */}
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
          flexWrap: "nowrap",
          px: { xs: 1.5, sm: 3 },
          py: 1,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.85)",
          boxShadow: isSticky
            ? "0 4px 12px rgba(0,0,0,.15)"
            : "0 1px 4px rgba(0,0,0,.08)",
          transition: "box-shadow .25s, background .25s",
        }}
      >
        {/* אייקונים חברתיים */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            component="a"
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "#fff",
              background: "linear-gradient(135deg,#3b5998 0%,#2d4373 100%)",
              "&:hover": { background: "#29487d" },
              width: 40,
              height: 40,
            }}
          >
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href={`https://wa.me/972${contact.contactWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "#fff",
              background: "linear-gradient(135deg,#25d366 0%,#128c7e 100%)",
              "&:hover": { background: "#1ebc5b" },
              width: 40,
              height: 40,
            }}
          >
            <WhatsAppIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href={`tel:972${contact.contactPhone}`}
            sx={{
              color: "#fff",
              background: "linear-gradient(135deg,#b388ff 0%,#9575cd 100%)",
              "&:hover": { background: "#7e57c2" },
              width: 40,
              height: 40,
            }}
          >
            <PhoneIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* כפתורי ניווט */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, flexGrow: 1, justifyContent: "center" }}>
          {[
            { label: "סקרים", onClick: onScrollToSurveys },
            { label: "לוח שנה", onClick: onScrollToActivities },
            { label: "הודעות", onClick: onScrollToMessages },
            { label: "פעילויות", onClick: onScrollToFlyers },
          ].map((btn) => (
            <Button
              key={btn.label}
              onClick={btn.onClick}
              sx={{
                position: "relative",
                color: purple,
                fontWeight: 600,
                textTransform: "none",
                px: { xs: 1, sm: 2 },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  width: "100%",
                  height: 3,
                  borderRadius: 2,
                  background: `linear-gradient(90deg,${purple} 0%,${theme.palette.primary.light} 100%)`,
                  transform: "scaleX(0)",
                  transformOrigin: "right",
                  transition: "transform .25s",
                },
                "&:hover::after": {
                  transform: "scaleX(1)",
                  transformOrigin: "left",
                },
              }}
            >
              {btn.label}
            </Button>
          ))}
        </Box>

        {/* לוגו (לבד) */}
        <Box
          component="img"
          src="/logo.jpeg"
          alt="Logo"
          sx={{ height: 42, cursor: "pointer", borderRadius: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </Box>

      {/* ─────  כפתור נגישוּת צף  ───── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: theme.zIndex.tooltip,
        }}
      >
        <AccessibilityWidget />
      </Box>
    </>
  );
}
