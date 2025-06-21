// src/components/Home.jsx
import { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PollIcon from "@mui/icons-material/Poll";
import MessageIcon from "@mui/icons-material/Message";
import GroupIcon from "@mui/icons-material/Group";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import BarChartIcon from "@mui/icons-material/BarChart";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import MessageService from "../services/MessageService";

export default function Home() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Only general messages (no activityId)
    MessageService.list()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);
  }, []);

  // Duplicate for seamless scroll (still available if needed)
  const tickerMessages = [...messages, ...messages];

  const adminItems = [
    {
      label: "ניהול פעילויות",
      icon: <EventIcon fontSize="large" />,
      to: "/activities",
    },
    {
      label: "ניהול פלאיירים",
      icon: <LocalOfferIcon fontSize="large" />,
      to: "/flyers",
    },
    {
      label: "ניהול סקרים",
      icon: <PollIcon fontSize="large" />,
      to: "/surveys",
    },
    {
      label: "ניהול הודעות",
      icon: <MessageIcon fontSize="large" />,
      to: "/messages",
    },
    {
      label: "ניהול משתמשים",
      icon: <GroupIcon fontSize="large" />,
      to: "/manage-users",
    },
    {
      label: "תמונות אווירה",
      icon: <PhotoLibraryIcon fontSize="large" />,
      to: "/HomepageImages",
    },
    {
      label: "ניתוח נתונים",
      icon: <BarChartIcon fontSize="large" />,
      to: "/Data-analysis",
    },
    {
      label: "פרטי קשר",
      icon: <ContactMailIcon fontSize="large" />,
      to: "/contact-details",
    },
  ];

  return (
    <>
      <Container sx={{ pt: 4 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mt: -2 }}
        >
          דף ניהול מרכז ותיקים
        </Typography>

        <Grid container spacing={4} justifyContent="center" sx={{ mt: 7 }}>
          {adminItems.map((it) => (
            <Grid item key={it.label} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  width: 200,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea component={RouterLink} to={it.to}>
                  <CardContent sx={{ textAlign: "center", py: 7 }}>
                    {it.icon}
                    <Typography variant="h6" sx={{ mt: 1 }}>
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
