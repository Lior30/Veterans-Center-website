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
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MessageService from "../services/MessageService.js";
import ActivityService from "../services/ActivityService.js";
import FlyerService from "../services/FlyerService.js";
import CalendarPreview from "./CalendarPreview.jsx";
import IdentifyPage from "./IdentificationPage.jsx";
import CloseIcon from "@mui/icons-material/Close";

export default function GuestLandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [flyers, setFlyers] = useState([]);

  const [selectedFlyerIndex, setSelectedFlyerIndex] = useState(0);
  const selectedFlyer = flyers[selectedFlyerIndex] || null;
  const [flyerDialogOpen, setFlyerDialogOpen] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openIdentify, setOpenIdentify] = useState(false);
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);

  const [imageIndex, setImageIndex] = useState(0);
  const moodImages = ["/image1.png", "/image2.png", "/image3.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % moodImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    MessageService.list()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);

    const unsub = ActivityService.subscribe((list) => setActivities(list));
    return () => unsub();
  }, []);

  useEffect(() => {
    FlyerService.getFlyers().then(setFlyers).catch(console.error);
  }, []);

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
      {/* לוגו וכפתור הזדהות */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexDirection: isMobile ? "column" : "row",
          gap: 2,
        }}
      >
        <Box component="img" src="/logo.jpeg" alt="לוגו" sx={{ height: isMobile ? 40 : 64 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenIdentify(true)}
          sx={{
            px: 4,
            py: 1,
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: 2,
          }}
        >
          הזדהות
        </Button>
      </Box>

      {/* כותרת */}
      <Fade in timeout={800}>
        <Typography variant="h3" align="center" color="primary.main" gutterBottom>
          מרכז ותיקים בית הכרם
        </Typography>
      </Fade>

      {/* פליירים ותמונות אווירה */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "center", gap: 2 }}>
        <Card sx={{ flex: 1, p: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            {selectedFlyer ? (
              <>
                <Box
                  component="img"
                  src={selectedFlyer.fileUrl}
                  alt={`פלייר: ${selectedFlyer.name}`}
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
                  <Button variant="outlined" disabled={selectedFlyerIndex === 0} onClick={() => setSelectedFlyerIndex(i => i - 1)}>הקודם</Button>
                  <Button variant="outlined" disabled={selectedFlyerIndex === flyers.length - 1} onClick={() => setSelectedFlyerIndex(i => i + 1)}>הבא</Button>
                </Box>
              </>
            ) : (
              <Typography>אין פליירים להצגה.</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, p: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>תמונות אווירה</Typography>
            <Box
              component="img"
              src={moodImages[imageIndex]}
              alt={`תמונת אווירה ${imageIndex + 1}`}
              sx={{
                width: "100%",
                maxWidth: 320,
                borderRadius: 2,
                boxShadow: 3,
                transition: "0.5s ease-in-out",
              }}
            />
          </CardContent>
        </Card>
      </Box>
      <Fade in timeout={1000}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" color="primary.main" gutterBottom>
              פעילויות השבוע
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                overflowX: isMobile ? "visible" : "auto",
                gap: 2,
                py: 2,
              }}
            >
              {getUpcomingWeekActivities().map((activity) => (
                <Card
                  key={activity.id}
                  sx={{
                    minWidth: isMobile ? "100%" : 260,
                    p: 2,
                    backgroundColor: "#faf5fb",
                    border: "1px solid #91278F",
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="h6" color="primary.main">
                    {activity.name}
                  </Typography>
                  <Typography variant="body2">תאריך: {activity.date}</Typography>
                  <Typography variant="body2">שעה: {activity.startTime} - {activity.endTime}</Typography>
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => setSelectedActivity(activity)}>פרטים</Button>
                    <Button size="small" variant="contained" onClick={() => setOpenPhoneDialog(true)}>הרשמה</Button>
                  </Box>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Grow in timeout={500}>
            <Card>
              <CardContent>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  הודעות אחרונות
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    p: 1,
                    gap: 2,
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
        </Grid>
      </Grid>

      <Fade in timeout={1000}>
        <Card sx={{ mt: 6 }}>
          <CardContent>
            <Typography variant="h5" color="primary.main" gutterBottom>
              לוח אירועים
            </Typography>
            <Box sx={{ pt: 2, "& .fc-daygrid-event": { pointerEvents: "none" } }}>
              <CalendarPreview />
            </Box>
          </CardContent>
        </Card>
      </Fade>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 6,
            py: 1.5,
            fontWeight: 700,
            borderRadius: 10,
            boxShadow: 3,
            background: "linear-gradient(90deg, #91278F 0%, #D81B60 100%)",
            color: "white",
            '&:hover': {
              background: "linear-gradient(90deg, #7a1e78 0%, #b1144e 100%)"
            }
          }}
          onClick={() => navigate("/home")}
        >
          כניסה למערכת הניהול
        </Button>
      </Box>

      {/* דיאלוגים */}
      <Dialog open={Boolean(selectedActivity)} onClose={() => setSelectedActivity(null)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedActivity?.name}</DialogTitle>
        <DialogContent dividers>
          <Typography>תאריך: {selectedActivity?.date}</Typography>
          <Typography>שעות: {selectedActivity?.startTime} - {selectedActivity?.endTime}</Typography>
          <Typography sx={{ mt: 2 }}>{selectedActivity?.description || "אין תיאור זמין."}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedActivity(null)}>סגור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={flyerDialogOpen} onClose={() => setFlyerDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2, pr: 5, position: "relative" }}>
          {selectedFlyer?.name}
          <Button
            onClick={() => setFlyerDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
              minWidth: 0,
              padding: 0
            }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent dividers>
          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                const activity = activities.find(a => a.id === selectedFlyer?.activityId);
                if (activity) {
                  setFlyerDialogOpen(false);
                  setSelectedActivity(activity);
                }
              }}
              disabled={!selectedFlyer?.activityId}
            >
              לפרטים
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setFlyerDialogOpen(false);
                setOpenPhoneDialog(true);
              }}
            >
              להרשמה
            </Button>
          </Stack>

          <Box
            component="img"
            src={selectedFlyer?.fileUrl}
            alt={`פלייר: ${selectedFlyer?.name}`}
            sx={{
              width: "100%",
              borderRadius: 2,
              boxShadow: 3
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openIdentify} onClose={() => setOpenIdentify(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <IdentifyPage />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIdentify(false)}>ביטול</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPhoneDialog} onClose={() => setOpenPhoneDialog(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <IdentifyPage />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPhoneDialog(false)}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
