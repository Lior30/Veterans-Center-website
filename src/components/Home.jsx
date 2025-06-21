// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import EventIcon        from "@mui/icons-material/Event";
import LocalOfferIcon   from "@mui/icons-material/LocalOffer";
import PollIcon         from "@mui/icons-material/Poll";
import MessageIcon      from "@mui/icons-material/Message";
import GroupIcon        from "@mui/icons-material/Group";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import BarChartIcon     from "@mui/icons-material/BarChart";
import ContactMailIcon  from "@mui/icons-material/ContactMail";

import MessageService   from "../services/MessageService";

export default function Home() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState([]);
  useEffect(() => {
    MessageService.list()
      .then(ms => setMessages(ms.filter(m => !m.activityId)))
      .catch(console.error);
  }, []);

  const adminItems = [
    { label: "ניהול פעילויות",    icon: <EventIcon        fontSize="large" />, to: "/activities"       },
    { label: "ניהול פלאיירים",    icon: <LocalOfferIcon   fontSize="large" />, to: "/flyers"           },
    { label: "ניהול סקרים",       icon: <PollIcon         fontSize="large" />, to: "/surveys"          },
    { label: "ניהול הודעות",      icon: <MessageIcon      fontSize="large" />, to: "/messages"         },
    { label: "ניהול משתמשים",     icon: <GroupIcon        fontSize="large" />, to: "/manage-users"     },
    { label: "תמונות אווירה",    icon: <PhotoLibraryIcon fontSize="large" />, to: "/HomepageImages"   },
    { label: "ניתוח נתונים",      icon: <BarChartIcon     fontSize="large" />, to: "/Data-analysis"    },
    { label: "פרטי קשר",         icon: <ContactMailIcon  fontSize="large" />, to: "/contact-details"  },
  ];

  return (
    <>
      {/* ראשית: פס עליון עם גרדיאנט */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.vlight} 0%, ${theme.palette.secondary.light} 100%)`,
          py: { xs: 5, sm: 7 },
          mb: { xs: 4, sm: 6 },
          borderBottomLeftRadius: 48,
          borderBottomRightRadius: 48,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant={isMobile ? "h4" : "h3"}
            align="center"
            sx={{ fontWeight: 700, color: theme.palette.primary.dark }}
          >
            דף ניהול מרכז ותיקים
          </Typography>

          {/* טיקר אופציונלי */}
          {messages.length > 0 && (
            <Box
              sx={{
                mt: 3,
                overflow: "hidden",
                whiteSpace: "nowrap",
                "& > span": {
                  display: "inline-block",
                  pr: 6,
                  animation: "ticker 20s linear infinite",
                },
                "@keyframes ticker": {
                  "0%":   { transform: "translateX(100%)" },
                  "100%": { transform: "translateX(-100%)" },
                },
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              <span>{[...messages, ...messages].map(m => m.title).join("   ⚬   ")}</span>
            </Box>
          )}
        </Container>
      </Box>

      {/* רשת הכרטיסים */}
      <Container sx={{ pb: { xs: 6, md: 8 } }}>
        <Grid container spacing={4} justifyContent="center">
          {adminItems.map(it => (
            <Grid item key={it.label} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "transform .25s, box-shadow .25s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={it.to}
                  sx={{ height: "100%" }}
                >
                  <CardContent
                    sx={{
                      py: 7,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.palette.primary.vlight,
                        color: theme.palette.primary.main,
                        fontSize: 32,
                      }}
                    >
                      {it.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 1,
                        fontSize: { xs: "1.05rem", sm: "1.1rem" },
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {it.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
