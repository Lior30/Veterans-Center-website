// src/components/Home.jsx
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BarChartIcon from "@mui/icons-material/BarChart";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MessageIcon from "@mui/icons-material/Message";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PollIcon from "@mui/icons-material/Poll";

import MessageService from "../services/MessageService";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState([]);
  useEffect(() => {
    MessageService.list()
      .then(ms => setMessages(ms.filter(m => !m.activityId)))
      .catch(console.error);
  }, []);

  const adminItems = [
    { label: "ניהול פעילויות", icon: <EventIcon fontSize="large" />, to: "/activities" },
    { label: "ניהול פלאיירים", icon: <LocalOfferIcon fontSize="large" />, to: "/flyers" },
    { label: "ניהול סקרים", icon: <PollIcon fontSize="large" />, to: "/surveys" },
    { label: "ניהול הודעות", icon: <MessageIcon fontSize="large" />, to: "/messages" },
    { label: "ניהול משתמשים", icon: <GroupIcon fontSize="large" />, to: "/manage-users" },
    { label: "תמונות אווירה", icon: <PhotoLibraryIcon fontSize="large" />, to: "/HomepageImages" },
    { label: "ניתוח נתונים", icon: <BarChartIcon fontSize="large" />, to: "/Data-analysis" },
    { label: "פרטי קשר", icon: <ContactMailIcon fontSize="large" />, to: "/contact-details" },
  ];

  const rows = [adminItems.slice(0, 4), adminItems.slice(4, 8)];

  return (
    <Box
      sx={{
        backgroundColor:
          theme.palette.mode === "light"
            ? "#faf9ff"
            : theme.palette.background.default,
        pt: 0,
        pb: { xs: 4, md: 6 },
      }}
    >
      {/* Top strip with gradient background + title + back button */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.vlight} 0%, ${theme.palette.secondary.light} 100%)`,
          py: { xs: 4, sm: 6 },
          mb: { xs: 3, sm: 5 },
          borderBottomLeftRadius: 64,
          borderBottomRightRadius: 64,
        }}
      >
        <Container maxWidth="md">
          {/* Title and back button */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.dark,
                position: "relative",
                "&::after": {
                  content: '""',
                  display: "block",
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: theme.palette.primary.main,
                  mt: 1,
                },
              }}
            >
              דף ניהול מרכז ותיקים
            </Typography>

            {/* ✨ Back-to-landing-page button */}
            <Button
              variant="outlined"
              color="secondary"
              component={RouterLink}
              to="/"
              startIcon={<ArrowBackIosNewIcon />}
              sx={{
                fontWeight: 800,  // Increased from 600 to 700 (bold)
                backgroundColor: 'white',
                color: '#6A2576'  // Explicit black text for maximum contrast
              }}
            >
              לדף הבית
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Two rows of 4 cards each */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        {rows.map((rowItems, rowIndex) => (
          <Grid
            container
            spacing={{ xs: 2, md: 4 }}
            justifyContent="center"
            key={rowIndex}
            sx={{ mb: rowIndex === 0 ? 4 : 0 }}
          >
            {rowItems.map((it) => (
              <Grid item xs={12} sm={6} md={3} key={it.label}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    transition: "transform .3s, box-shadow .3s",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
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
                        py: { xs: 6, md: 8 },
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: theme.palette.primary.vlight,
                          color: theme.palette.primary.main,
                          fontSize: 34,
                          transition: "box-shadow .3s, transform .3s",
                          "&:hover": {
                            boxShadow: `0 0 0 12px ${theme.palette.primary.vlight}`,
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {it.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          mt: 1,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          letterSpacing: "0.5px",
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
        ))}
      </Container>
    </Box>
  );
}
