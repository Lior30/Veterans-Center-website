// src/components/HeroSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import {
  Info as InfoIcon,
  Event as EventIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";
import CtaButton from "./CtaButton";
import Logo from "/logo.jpeg";

const HeroWrapper = styled("section")(({ theme }) => ({
  position: "relative",
  color: theme.palette.primary.contrastText,
  textAlign: "right",
  direction: "rtl",
  backgroundSize: "cover",
  backgroundPosition: "center",
  minHeight: "100vh",            // תופס 100% מגובה החלון
  [theme.breakpoints.down("sm")]: {
    minHeight: "80vh",           // בנייד 80% מגובה החלון
    paddingTop: "64px"
  },
}));

const Overlay = styled(Box)({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
});

const HeroContent = styled(Container)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

export default function HeroSection({
  userProfile,
  onOpenIdentify,
  onOpenMyActivities,
  onOpenInfo,
  onScrollToCalendar,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box
            component="img"
            src={Logo}
            alt="לוגו המרכז"
            sx={{ height: { xs: 36, sm: 56 }, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
          <Box>
            <IconButton color="inherit" onClick={() => window.open("https://www.facebook.com", "_blank")}>
              <FacebookIcon />
            </IconButton>
            <IconButton color="inherit" onClick={onOpenInfo}>
              <InfoIcon />
            </IconButton>
            <IconButton color="inherit" onClick={onScrollToCalendar}>
              <EventIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <HeroWrapper sx={{ backgroundImage: `url('/image1.png')`, width: "100vw", ml: "calc(-50vw + 50%)" }}>
        <Overlay />

        <HeroContent maxWidth={false} disableGutters>
          <Typography
            variant={isMobile ? "h4" : "h2"}
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            מרכז ותיקים בית הכרם
          </Typography>

          {userProfile?.first_name && (
            <Typography
              variant={isMobile ? "h5" : "h4"}
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              שלום {userProfile.first_name}!
            </Typography>
          )}

          <Typography
            variant="body1"
            paragraph
            sx={{
              maxWidth: 600,
              fontSize: isMobile ? "0.9rem" : "1rem",
              lineHeight: 1.6,
            }}
          >
            ברוכים הבאים למועדון שמביא לכם פעילויות, הרצאות ורווחה בכל יום!
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {!userProfile?.first_name && (
              <CtaButton color="primary" onClick={onOpenIdentify}>
                הזדהות
              </CtaButton>
            )}

            <CtaButton
              color="warning"
              component="a"
              href="https://wa.me/0523705021"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<WhatsAppIcon />}

            >
              צור קשר בוואטסאפ
            </CtaButton>

            <CtaButton
              color="info"
              component="a"
              href="tel:0523705021"
              startIcon={<PhoneIcon />}
            >
              התקשר
            </CtaButton>

            {userProfile?.id && (
              <CtaButton color="success" onClick={onOpenMyActivities}>
                הפעילויות שלי
              </CtaButton>
            )}
          </Box>
        </HeroContent>
      </HeroWrapper>
    </>
  );
}
