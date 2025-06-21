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

  /* ───── תמונות־רקע מתחלפות ───── */
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

  /* ───── פרטי קשר ───── */
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

  /* ───── JSX ───── */
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#F3E5F5",
        borderRadius: { xs: 0, sm: 4 },
        mb: { xs: 3, sm: 5 },
      }}
    >
      {/* תמונה - צד שמאל 45 %  */}
     <Fade in={visible} timeout={900}>
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "60%",          // תמיד 45 %
      minHeight: 300,        // גובה מינימלי במובייל
      height: "100%",
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(145deg, rgba(124,77,255,.45) 0%, rgba(255,255,255,0) 40%)",
      },
      clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
    }}
  />
</Fade>


      {/* תוכן בימין */}
      <Container
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 5, md: 8 },
          [theme.breakpoints.up("md")]: { ml: "45%" }, // מפנה מקום לתמונה
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{ fontWeight: 700, color: "#4b0082", mb: 1 }}
            >
              מרכז ותיקים – בית הכרם
            </Typography>

            {userProfile?.first_name && (
              <Typography variant="h5" sx={{ color: "#6a1b9a", fontWeight: 600, mb: 1 }}>
                שלום {userProfile.first_name}!
              </Typography>
            )}

            <Typography
              sx={{
                maxWidth: 520,
                color: "#4c4c4c",
                mb: 3,
                fontSize: isMobile ? "0.92rem" : "1rem",
                lineHeight: 1.7,
              }}
            >
              ברוכים הבאים למועדון שעושה לכם טוב: פעילויות, הרצאות, מוזיקה
              ואווירה קהילתית – כל יום, כל השבוע!
            </Typography>

            {/* כפתורים */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>

  {/* הזדהות */}
 {!userProfile?.first_name && (
  <CtaButton
    onClick={onOpenIdentify}
    sx={{
      background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)",
      color: "#fff",
      "&:hover": {
        background: "linear-gradient(135deg,#6a1b9a 0%,#380f73 100%)",
      },
    }}
  >
    הזדהות
  </CtaButton>
)}


  {/* וואטסאפ */}
<CtaButton
  startIcon={<WhatsAppIcon />}
  href={`https://wa.me/972${contact.contactWhatsapp}`}
  target="_blank"
  rel="noopener noreferrer"
  sx={{
    /* גרדיינט ירוק – גוון מותג */
    background: "linear-gradient(135deg,#25d366 0%,#128c7e 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg,#20c05b 0%,#0f7d71 100%)",
    },
  }}
>
  וואטסאפ
</CtaButton>


  {/* התקשר – נשאר אותו גרדיינט לבנדרי */}
  <CtaButton
    startIcon={<PhoneIcon />}
    href={`tel:972${contact.contactPhone}`}
    sx={{
      background: "linear-gradient(135deg,#b388ff 0%,#9575cd 100%)",
      color: "#fff",
      "&:hover": { background: "linear-gradient(135deg,#a06dff 0%,#8360c7 100%)" },
    }}
  >
    התקשר
  </CtaButton>

  {/* הפעילויות שלי */}
{userProfile?.id && (
  <CtaButton
    onClick={onOpenMyActivities}
    sx={{
      /* סגול כהה → כהה-יותר */
      background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)",
      color: "#fff",
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
