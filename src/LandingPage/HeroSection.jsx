// src/components/HeroSection.jsx
// NOTE: only style tweaks for responsive mobile support – logic & API calls unchanged
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

  /*rotating banners */
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
    const SHOW = 6000,
      FADE = 900;
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

  /*contact details*/
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

  /*JSX*/
  return (
   <Box
  component="section"
  sx={{
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F3E5F5	", // סגול כהה יותר
    borderRadius: 0,
    mb: { xs: 3, sm: 5 },
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // ✔️ הצללה אלגנטית
  }}
>

      {/* BG IMAGE – left on desktop, full‑width on mobile */}
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
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: {
               xs: "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 70%)",
         md: "linear-gradient(145deg, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 40%)",
              },
            },
          }}
        />
      </Fade>

      {/* CONTENT */}
      <Container
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3 },
          ml: { md: "55%" }, // leave space for image on desktop
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? "h5" : "h3"}
              sx={{ fontWeight: 700, color: "#4b0082", mb: 1, textAlign: { xs: "center", md: "right" } }}
            >
              מרכז ותיקים – בית הכרם
            </Typography>

            {userProfile?.first_name && (
              <Typography
                variant={isMobile ? "h4" : "h3"}
                sx={{ color: "#6a1b9a", fontWeight: 800, mb: 1, textAlign: { xs: "center", md: "right" } }}
              >
                שלום {userProfile.first_name}!
              </Typography>
            )}

            <Typography
              sx={{
                maxWidth: 520,
                mx: { xs: "auto", md: 0 },
                color: "#4c4c4c",
                mb: 3,
                fontSize: isMobile ? "0.9rem" : "1rem",
                lineHeight: 1.7,
                textAlign: { xs: "center", md: "right" },
              }}
            >
              ברוכים הבאים למועדון שעושה לכם טוב: פעילויות, הרצאות, מוזיקה
              ואווירה קהילתית – כל יום, כל השבוע!
            </Typography>

            {/* ACTION BUTTONS */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {/* IDENTIFY */}
              {!userProfile?.first_name && (
                <CtaButton
                  onClick={onOpenIdentify}
                  sx={{
                    background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)",
                    color: "#fff",
                    px: { xs: 2.5, sm: 3.5 },
                    "&:hover": {
                      background: "linear-gradient(135deg,#6a1b9a 0%,#380f73 100%)",
                    },
                  }}
                >
                  הזדהות
                </CtaButton>
              )}

              {/* WHATSAPP */}
              <CtaButton
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/972${contact.contactWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background: "linear-gradient(135deg,#25d366 0%,#128c7e 100%)",
                  color: "#fff",
                  px: { xs: 2.5, sm: 3.5 },
                  "&:hover": {
                    background: "linear-gradient(135deg,#20c05b 0%,#0f7d71 100%)",
                  },
                }}
              >
                וואטסאפ
              </CtaButton>

              {/* CALL */}
              <CtaButton
                startIcon={<PhoneIcon />}
                href={`tel:972${contact.contactPhone}`}
                sx={{
                  background: "linear-gradient(135deg,#b388ff 0%,#9575cd 100%)",
                  color: "#fff",
                  px: { xs: 2.5, sm: 3.5 },
                  "&:hover": {
                    background: "linear-gradient(135deg,#a06dff 0%,#8360c7 100%)",
                  },
                }}
              >
                התקשר
              </CtaButton>

              {/* MY ACTIVITIES */}
              {userProfile?.id && (
                <CtaButton
                  onClick={onOpenMyActivities}
                  sx={{
                    background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)",
                    color: "#fff",
                    px: { xs: 2.5, sm: 3.5 },
                    "&:hover": {
                      background: "linear-gradient(135deg,#6a1b9a 0%,#380f73 100%)",
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
