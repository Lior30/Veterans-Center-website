// src/components/HeroSection.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { WhatsApp as WhatsAppIcon, Phone as PhoneIcon } from "@mui/icons-material";
import CtaButton from "./CtaButton";
import BannerService from "../services/BannerService";
import ContactService from "../services/ContactService";

export default function HeroSection({ userProfile, onOpenIdentify, onOpenMyActivities }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    BannerService.getBanners()
      .then((items) => setBanners(items.map((b) => b.url)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const SHOW = 6000, FADE = 900;
    let t1, t2, loop;

    const cycle = () => {
      t1 = setTimeout(() => {
        setVisible(false);
        t2 = setTimeout(() => {
          setIdx((i) => (i + 1) % banners.length);
          setVisible(true);
        }, FADE);
      }, SHOW);
    };

    cycle();
    loop = setInterval(cycle, SHOW + FADE * 2);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(loop);
    };
  }, [banners]);

  const [contact, setContact] = useState({ contactPhone: "", contactWhatsapp: "" });
  useEffect(() => {
    ContactService.get().then((d) =>
      setContact({
        contactPhone: d.contactPhone ?? "",
        contactWhatsapp: d.contactWhatsapp ?? "",
      })
    );
  }, []);

  const bgUrl = banners[idx] ?? "";

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #e1bee7, #d1c4e9)",
        borderRadius: 0,
        mb: { xs: 3, sm: 5 },
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Fade in={visible} timeout={900}>
        <Box
          sx={{
            position: { xs: "relative", md: "absolute" },
            top: 0,
            left: 0,
            width: { xs: "100%", md: "60%" },
            height: { xs: 240, sm: 350, md: "100%" },
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            clipPath: {
              xs: "none",
              md: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
            },
            boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.2)",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: {
                xs: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)",
                md: "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)",
              },
            },
          }}
        />
      </Fade>

      <Container
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3 },
          ml: { md: "55%" },
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? "h5" : "h3"}
              sx={{
                fontWeight: 800,
                color: "#4a148c",
                mb: 1,
                textAlign: { xs: "center", md: "right" },
              }}
            >
              מרכז ותיקים – בית הכרם
            </Typography>

            {userProfile?.first_name && (
              <Typography
                variant={isMobile ? "h4" : "h3"}
                sx={{
                  color: "#6a1b9a",
                  fontWeight: 800,
                  mb: 1,
                  textAlign: { xs: "center", md: "right" },
                }}
              >
                שלום {userProfile.first_name}!
              </Typography>
            )}

            <Typography
              sx={{
                maxWidth: 520,
                mx: { xs: "auto", md: 0 },
                color: "#3a3a3a",
                mb: 3,
                fontSize: isMobile ? "0.95rem" : "1.05rem",
                lineHeight: 1.8,
                textAlign: { xs: "center", md: "right" },
              }}
            >
              ברוכים הבאים למועדון שעושה לכם טוב: פעילויות, הרצאות, מוזיקה
              ואווירה קהילתית – כל יום, כל השבוע!
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {!userProfile?.first_name && (
                <CtaButton
                  onClick={onOpenIdentify}
                  sx={{
                    background: "linear-gradient(135deg,#7e57c2 0%,#5e35b1 100%)",
                    color: "#fff",
                    px: { xs: 2.5, sm: 3.5 },
                    "&:hover": {
                      background: "linear-gradient(135deg,#6a1b9a 0%,#4527a0 100%)",
                    },
                  }}
                >
                  הזדהות
                </CtaButton>
              )}

              <CtaButton
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/972${contact.contactWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background: "linear-gradient(135deg,#66bb6a 0%,#43a047 100%)",
                  color: "#fff",
                  px: { xs: 2.5, sm: 3.5 },
                  "&:hover": {
                    background: "linear-gradient(135deg,#4caf50 0%,#388e3c 100%)",
                  },
                }}
              >
                וואטסאפ
              </CtaButton>

              <CtaButton
                startIcon={<PhoneIcon />}
                href={`tel:972${contact.contactPhone}`}
                sx={{
                  background: "linear-gradient(135deg,#b39ddb 0%,#9575cd 100%)",
                  color: "#fff",
                  px: { xs: 2.5, sm: 3.5 },
                  "&:hover": {
                    background: "linear-gradient(135deg,#9575cd 0%,#7e57c2 100%)",
                  },
                }}
              >
                התקשר
              </CtaButton>

              {userProfile?.id && (
                <CtaButton
                  onClick={onOpenMyActivities}
                  sx={{
                    background: "linear-gradient(135deg,#7e57c2 0%,#5e35b1 100%)",
                    color: "#fff",
                    px: { xs: 2.5, sm: 3.5 },
                    "&:hover": {
                      background: "linear-gradient(135deg,#6a1b9a 0%,#4527a0 100%)",
                    },
                  }}
                >
                  הפעילויות שלי
                </CtaButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
