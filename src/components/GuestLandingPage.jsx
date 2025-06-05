// src/components/GuestLandingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Grow,
  Fade,
} from "@mui/material";

import MessageService from "../services/MessageService.js";
import SurveyService from "../services/SurveyService.js";
import ActivityService from "../services/ActivityService.js";
import FlyerService from "../services/FlyerService.js";
import CalendarPreview from "./CalendarPreview.jsx";

import IdentifyPage from "./IdentificationPage.jsx"; // <–– Import the full IdentifyPage

export default function GuestLandingPage() {
  const navigate = useNavigate();

  // ───────────────────────────
  // Data state (messages, surveys, activities, flyers)
  // ───────────────────────────
  const [messages, setMessages] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [activities, setActivities] = useState([]);
  const [flyers, setFlyers] = useState([]);

  // Flyer carousel state
  const [selectedFlyerIndex, setSelectedFlyerIndex] = useState(0);
  const selectedFlyer = flyers[selectedFlyerIndex] || null;
  const [flyerDialogOpen, setFlyerDialogOpen] = useState(false);

  // Activity “Details” dialog
  const [selectedActivity, setSelectedActivity] = useState(null);

  // “הזדהות” Dialog (contains IdentifyPage)
  const [openIdentify, setOpenIdentify] = useState(false);

  // ───────────────────────────
  // Load data on mount
  // ───────────────────────────
  useEffect(() => {
    MessageService.list()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);

    SurveyService.list().then(setSurveys).catch(console.error);

    const unsub = ActivityService.subscribe((list) => setActivities(list));
    return () => unsub();
  }, []);

  useEffect(() => {
    FlyerService.getFlyers().then(setFlyers).catch(console.error);
  }, []);

  // ───────────────────────────
  // Helper to filter next 7 days
  // ───────────────────────────
  const getUpcomingWeekActivities = () => {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    return activities.filter((a) => {
      const d = new Date(a.date);
      return d >= now && d <= oneWeekFromNow;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ======================= */}
      {/* 1. כפתור “הזדהות” בראש */}
      {/* ======================= */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenIdentify(true)}
          sx={{
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: 3,
          }}
        >
          הזדהות
        </Button>
      </Box>

      {/* Dialog that opens IdentifyPage in a small window */}
      <Dialog
        open={openIdentify}
        onClose={() => setOpenIdentify(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          {/* Embed the IdentifyPage component here, unchanged */}
          <IdentifyPage />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIdentify(false)}>ביטול</Button>
        </DialogActions>
      </Dialog>

      {/* ============================== */}
      {/* 2. תוכן הראשי של דף האורחים */}
      {/* ============================== */}
      <Fade in timeout={800}>
        <Typography
          variant="h3"
          align="center"
          color="primary.main"
          gutterBottom
        >
          מרכז ותיקים בית הכרם
        </Typography>
      </Fade>

      {/* פעילויות השבוע – אורחים (ללא כפתור “הרשמה”) */}
      <Fade in timeout={1000}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" color="secondary.main" gutterBottom>
              פעילויות השבוע
            </Typography>
            <Box sx={{ display: "flex", overflowX: "auto", gap: 2, py: 2 }}>
              {getUpcomingWeekActivities().map((activity) => (
                <Card
                  key={activity.id}
                  sx={{ minWidth: 260, p: 2, backgroundColor: "#fdfdfd" }}
                >
                  <Typography variant="h6" color="primary.main">
                    {activity.name}
                  </Typography>
                  <Typography variant="body2">
                    תאריך: {activity.date}
                  </Typography>
                  <Typography variant="body2">
                    שעה: {activity.startTime} - {activity.endTime}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      פרטים
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* הודעות + סקרים + פליירים */}
      <Grid container spacing={4} sx={{ mt: 4, flexWrap: "nowrap" }}>
        <Grid item md={8}>
          <Stack spacing={4}>
            {/* הודעות אחרונות */}
            <Grow in timeout={500}>
              <Card sx={{ background: "linear-gradient(135deg, #f0f4ff, #ffffff)" }}>
                <CardContent>
                  <Typography variant="h5" color="secondary.main" gutterBottom>
                    הודעות אחרונות
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      overflowX: "auto",
                      p: 1,
                      gap: 2,
                      "&::-webkit-scrollbar": { height: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
                        borderRadius: 4,
                      },
                    }}
                  >
                    {messages.map((m) => (
                      <Card
                        key={m.id}
                        sx={{
                          minWidth: 220,
                          p: 2,
                          flexShrink: 0,
                          transition: "0.3s",
                          "&:hover": { boxShadow: 6 },
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          {m.title}
                        </Typography>
                        <Typography variant="body2">{m.body}</Typography>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>

            {/* סקרים פתוחים */}
            <Grow in timeout={800}>
              <Card sx={{ background: "linear-gradient(135deg, #fff7f0, #ffffff)" }}>
                <CardContent>
                  <Typography variant="h5" color="secondary.main" gutterBottom>
                    סקרים פתוחים
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      overflowX: "auto",
                      p: 1,
                      gap: 2,
                      "&::-webkit-scrollbar": { height: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
                        borderRadius: 4,
                      },
                    }}
                  >
                    {surveys.map((s) => (
                      <Card
                        key={s.id}
                        sx={{
                          minWidth: 220,
                          p: 2,
                          flexShrink: 0,
                          transition: "0.3s",
                          "&:hover": { boxShadow: 6 },
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          {s.title}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Stack>
        </Grid>

        {/* פליירים */}
        <Grid item md={4}>
          {selectedFlyer && (
            <Grow in timeout={1200}>
              <Card
                sx={{
                  textAlign: "center",
                  p: 2,
                  background: "linear-gradient(135deg, #e0f7ff, #ffffff)",
                }}
              >
                <CardContent>
                  <Box
                    component="img"
                    src={selectedFlyer.fileUrl}
                    alt={selectedFlyer.name}
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      borderRadius: 2,
                      boxShadow: 3,
                      cursor: "pointer",
                      mb: 2,
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                    onClick={() => setFlyerDialogOpen(true)}
                  />
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button
                      variant="outlined"
                      disabled={selectedFlyerIndex === 0}
                      onClick={() => setSelectedFlyerIndex((i) => i - 1)}
                    >
                      הקודם
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={selectedFlyerIndex === flyers.length - 1}
                      onClick={() => setSelectedFlyerIndex((i) => i + 1)}
                    >
                      הבא
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}
        </Grid>
      </Grid>

      {/* לוח אירועים */}
      <Fade in timeout={1000}>
        <Card sx={{ mt: 6 }}>
          <CardContent>
            <Typography variant="h5" color="secondary.main" gutterBottom>
              לוח אירועים
            </Typography>

            {/* 
              מנטרלים pointer-events באלמנטים של FullCalendar (class = fc-daygrid-event)
              כדי שהאורח לא יוכל לפתוח דיאלוג הרשמה.
            */}
            <Box
              sx={{
                pt: 2,
                "& .fc-daygrid-event": {
                  pointerEvents: "none",
                },
              }}
            >
              <CalendarPreview />
            </Box>
          </CardContent>
        </Card>
      </Fade>

        {/* כפתור ניהול */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button variant="contained" size="large" onClick={() => navigate("/home")}>
                כניסה למערכת הניהול
            </Button>
        </Box>

      {/* דיאלוג לפירוט פעילות בלבד */}
      <Dialog
        open={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedActivity?.name}</DialogTitle>
        <DialogContent dividers>
          <Typography>תאריך: {selectedActivity?.date}</Typography>
          <Typography>
            שעות: {selectedActivity?.startTime} - {selectedActivity?.endTime}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            {selectedActivity?.description || "אין תיאור זמין."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedActivity(null)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג להצגת הפלייר */}
      <Dialog
        open={flyerDialogOpen}
        onClose={() => setFlyerDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedFlyer?.name}</DialogTitle>
        <DialogContent dividers>
          <Box
            component="img"
            src={selectedFlyer?.fileUrl}
            alt={selectedFlyer?.name}
            sx={{ width: "100%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlyerDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
