// src/components/LandingNavBar.jsx
// Desktop: one row · Mobile: two rows (social+logo, nav buttons)
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import ContactService from "../services/ContactService";
import AccessibilityWidget from "./AccessibilityWidget";

export default function LandingNavBar({
  onScrollToFlyers,
  onScrollToMessages,
  onScrollToActivities,
  onScrollToSurveys,
  justIdentified = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const purple = theme.palette.primary.main;

  /* sticky state */
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* contact details */
  const [contact, setContact] = useState({ contactPhone: "", contactWhatsapp: "" });
  useEffect(() => {
    ContactService.get().then((d) =>
      setContact({
        contactPhone: d.contactPhone ?? "",
        contactWhatsapp: d.contactWhatsapp ?? "",
      })
    );
  }, []);

  /* navigation buttons */
  const navButtons = [
    ...(justIdentified ? [{ label: "סקרים", onClick: onScrollToSurveys }] : []),
    { label: "לוח שנה", onClick: onScrollToActivities },
    { label: "פעילויות", onClick: onScrollToFlyers },
    { label: "הודעות", onClick: onScrollToMessages },

  ];

  const socialBtnStyle = {
    color: "#fff",
    width: isMobile ? 30 : 36,
    height: isMobile ? 30 : 36,
  };

  /* helper: nav buttons component */
  const NavButtons = () => (
    <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
      {navButtons.map((btn) => (
        <Button
          key={btn.label}
          onClick={btn.onClick}
          sx={{
            position: "relative",
            color: purple,
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            textTransform: "none",
            px: { xs: 1.25, sm: 2 },
            minWidth: 80,
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
  );

  return (
    <>
      <Box
        component="nav"
        dir="ltr"
        sx={{
          position: isSticky ? "fixed" : "static",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: theme.zIndex.appBar,
          backdropFilter: "blur(10px)",
          background: "rgba(245, 245, 245, 0.85)",
          boxShadow: isSticky
            ? "0 4px 12px rgba(0,0,0,.15)"
            : "0 1px 4px rgba(0,0,0,.08)",
          transition: "box-shadow .25s, background .25s",
          px: { xs: 1, sm: 3 },
          py: { xs: 0.75, sm: 1 },
        }}
      >
        {/* DESKTOP: single row */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* social */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                component="a"
                href="https://www.facebook.com/minhalbk?locale=he_IL"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...socialBtnStyle, background: "#3b5998", "&:hover": { opacity: 0.85 } }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href={`https://wa.me/972${contact.contactWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ...socialBtnStyle, background: "#25d366", "&:hover": { opacity: 0.85 } }}
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href={`tel:972${contact.contactPhone}`}
                sx={{ ...socialBtnStyle, background: "#9575cd", "&:hover": { opacity: 0.85 } }}
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* nav buttons center */}
            <NavButtons />

            {/* logo */}
            <Box
              component="img"
              src="/logo.jpeg"
              alt="Logo"
              sx={{ height: 40, cursor: "pointer", borderRadius: 1 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          </Box>
        )}

        {/* MOBILE: two rows */}
        {isMobile && (
          <>
            {/* row 1 */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  component="a"
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ...socialBtnStyle, background: "#3b5998", "&:hover": { opacity: 0.85 } }}
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton
                  component="a"
                  href={`https://wa.me/972${contact.contactWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ...socialBtnStyle, background: "#25d366", "&:hover": { opacity: 0.85 } }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
                <IconButton
                  component="a"
                  href={`tel:972${contact.contactPhone}`}
                  sx={{ ...socialBtnStyle, background: "#9575cd", "&:hover": { opacity: 0.85 } }}
                >
                  <PhoneIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box
                component="img"
                src="/logo.jpeg"
                alt="Logo"
                sx={{ height: 34, cursor: "pointer", borderRadius: 1 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              />
            </Box>

            {/* row 2 */}
            <Box sx={{ mt: 0.75, display: "flex", justifyContent: "center" }}>
              <NavButtons />
            </Box>
          </>
        )}
      </Box>

      {/* floating accessibility */}
      <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: theme.zIndex.tooltip }}>
        <AccessibilityWidget />
      </Box>
    </>
  );
}
