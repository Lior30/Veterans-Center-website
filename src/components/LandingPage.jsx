// src/components/LandingPage.jsx
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
  TextField,
  Alert,
  Grow,
  Fade
} from "@mui/material";

import MessageService from "../services/MessageService.js";
import SurveyService from "../services/SurveyService.js";
import ActivityService from "../services/ActivityService.js";
import FlyerService from "../services/FlyerService.js";
import UserService from "../services/UserService.js";
import CalendarPreview from "./CalendarPreview.jsx";
import ReplyContainer from "./ReplyContainer.jsx";
import SurveyDetailContainer from "./SurveyDetailContainer.jsx";

export default function LandingPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [activities, setActivities] = useState([]);
  const [flyers, setFlyers] = useState([]);

  const [selectedFlyerIndex, setSelectedFlyerIndex] = useState(0);
  const selectedFlyer = flyers[selectedFlyerIndex] || null;
  const [flyerDialogOpen, setFlyerDialogOpen] = useState(false);

  const [activityRegId, setActivityRegId] = useState(null);
  const [participantName, setParticipantName] = useState("");
  const [participantPhone, setParticipantPhone] = useState("");
  const [participantErr, setParticipantErr] = useState("");

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    MessageService.list()
      .then(ms => setMessages(ms.filter(m => !m.activityId)))
      .catch(console.error);

    SurveyService.list()
      .then(setSurveys)
      .catch(console.error);

    const unsub = ActivityService.subscribe(list => setActivities(list));
    return () => unsub();
  }, []);

  useEffect(() => {
    FlyerService.getFlyers()
      .then(setFlyers)
      .catch(console.error);
  }, []);

  const validParticipantName = /^[A-Za-z\u0590-\u05FF\s]+$/.test(participantName.trim());
  const validParticipantPhone = UserService.isValidPhone(participantPhone.trim());

  const handleActivityRegister = async () => {
    if (!validParticipantName || !validParticipantPhone) {
      setParticipantErr("שם חייב אותיות בלבד, טלפון תקין (05XXXXXXXX)");
      return;
    }
    try {
      const user = await UserService.findOrCreate({
        name: participantName.trim(),
        phone: participantPhone.trim(),
      });
      await ActivityService.registerUser(activityRegId, {
        name: user.name,
        phone: user.phone,
      });
      alert("ההרשמה לפעילות בוצעה בהצלחה!");
      setActivityRegId(null);
      setParticipantName("");
      setParticipantPhone("");
      setParticipantErr("");
    } catch (e) {
      console.error("Registration error:", e);
      setParticipantErr("שגיאה בהרשמה, נסי שוב");
    }
  };

  const getUpcomingWeekActivities = () => {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    return activities.filter(a => {
      const d = new Date(a.date);
      return d >= now && d <= oneWeekFromNow;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Typography variant="h3" align="center" color="primary.main" gutterBottom>
          מרכז ותיקים בית הכרם
        </Typography>
      </Fade>

      {/* פעילויות השבוע - ראשון */}
      <Fade in timeout={1000}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" color="secondary.main" gutterBottom>
              פעילויות השבוע
            </Typography>
            <Box sx={{ display: "flex", overflowX: "auto", gap: 2, py: 2 }}>
              {getUpcomingWeekActivities().map(activity => (
                <Card key={activity.id} sx={{ minWidth: 260, p: 2, backgroundColor: "#fdfdfd" }}>
                  <Typography variant="h6" color="primary.main">{activity.name}</Typography>
                  <Typography variant="body2">תאריך: {activity.date}</Typography>
                  <Typography variant="body2">שעה: {activity.startTime} - {activity.endTime}</Typography>
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => setSelectedActivity(activity)}>
                      פרטים
                    </Button>
                    <Button size="small" variant="contained" onClick={() => setActivityRegId(activity.id)}>
                      הרשמה
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
            <Grow in timeout={500}>
              <Card sx={{ background: "linear-gradient(135deg, #f0f4ff, #ffffff)" }}>
                <CardContent>
                  <Typography variant="h5" color="secondary.main" gutterBottom>
                    הודעות אחרונות
                  </Typography>
                  <Box sx={{
                    display: "flex", overflowX: "auto", p: 1, gap: 2,
                    "&::-webkit-scrollbar": { height: 8 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: 4 }
                  }}>
                    {messages.map(m => (
                      <Card key={m.id} sx={{ minWidth: 220, p: 2, flexShrink: 0, transition: "0.3s", '&:hover': { boxShadow: 6 } }}>
                        <Typography variant="h6" gutterBottom>{m.title}</Typography>
                        <Typography variant="body2">{m.body}</Typography>
                        <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedMsg(m)} variant="outlined">
                          השב
                        </Button>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>

            <Grow in timeout={800}>
              <Card sx={{ background: "linear-gradient(135deg, #fff7f0, #ffffff)" }}>
                <CardContent>
                  <Typography variant="h5" color="secondary.main" gutterBottom>
                    סקרים פתוחים
                  </Typography>
                  <Box sx={{
                    display: "flex", overflowX: "auto", p: 1, gap: 2,
                    "&::-webkit-scrollbar": { height: 8 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: 4 }
                  }}>
                    {surveys.map(s => (
                      <Card key={s.id} sx={{ minWidth: 220, p: 2, flexShrink: 0, transition: "0.3s", '&:hover': { boxShadow: 6 } }}>
                        <Typography variant="h6" gutterBottom>{s.title}</Typography>
                        <Button variant="contained" size="small" onClick={() => setSelectedSurvey(s)}>
                          למילוי הסקר
                        </Button>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Stack>
        </Grid>

        <Grid item md={4}>
          {selectedFlyer && (
            <Grow in timeout={1200}>
              <Card sx={{ textAlign: "center", p: 2, background: "linear-gradient(135deg, #e0f7ff, #ffffff)" }}>
                <CardContent>
                  <Box
                    component="img"
                    src={selectedFlyer.fileUrl}
                    alt={selectedFlyer.name}
                    sx={{
                      width: "100%", maxWidth: 320, borderRadius: 2, boxShadow: 3, cursor: "pointer", mb: 2,
                      transition: "0.3s", '&:hover': { transform: "scale(1.03)" }
                    }}
                    onClick={() => setFlyerDialogOpen(true)}
                  />
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button variant="outlined" disabled={selectedFlyerIndex === 0} onClick={() => setSelectedFlyerIndex(i => i - 1)}>הקודם</Button>
                    <Button variant="outlined" disabled={selectedFlyerIndex === flyers.length - 1} onClick={() => setSelectedFlyerIndex(i => i + 1)}>הבא</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}
        </Grid>
      </Grid>

      {/* לוח שנה */}
      <Fade in timeout={1000}>
        <Card sx={{ mt: 6 }}>
          <CardContent>
            <Typography variant="h5" color="secondary.main" gutterBottom>
              לוח אירועים
            </Typography>
            <Box sx={{ pt: 2 }}>
              <CalendarPreview activities={activities} />
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

      <Dialog open={flyerDialogOpen} onClose={() => setFlyerDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{selectedFlyer?.name}</DialogTitle>
        <DialogContent dividers>
          <Box component="img" src={selectedFlyer?.fileUrl} alt={selectedFlyer?.name} sx={{ width: "100%" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>הרשמה</Button>
          <Button onClick={() => setFlyerDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedMsg)} onClose={() => setSelectedMsg(null)} fullWidth maxWidth="sm">
        <DialogTitle>השב להודעה: {selectedMsg?.title}</DialogTitle>
        <DialogContent dividers>
          <ReplyContainer messageId={selectedMsg?.id} onClose={() => setSelectedMsg(null)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedMsg(null)}>סגור</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedSurvey)} onClose={() => setSelectedSurvey(null)} fullWidth maxWidth="sm">
        <DialogTitle>מילוי סקר: {selectedSurvey?.title}</DialogTitle>
        <DialogContent dividers>
          <SurveyDetailContainer surveyId={selectedSurvey?.id} onClose={() => setSelectedSurvey(null)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedSurvey(null)}>סגור</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(activityRegId)} onClose={() => setActivityRegId(null)} fullWidth maxWidth="sm">
        <DialogTitle>הרשמה לפעילות</DialogTitle>
        <DialogContent>
          {participantErr && <Alert severity="error" sx={{ mb: 2 }}>{participantErr}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="שם מלא" value={participantName} onChange={e => setParticipantName(e.target.value)} fullWidth error={participantName && !validParticipantName} helperText={participantName && !validParticipantName ? "אותיות ורווחים בלבד" : " "} />
            <TextField label="טלפון" value={participantPhone} onChange={e => setParticipantPhone(e.target.value)} fullWidth error={participantPhone && !validParticipantPhone} helperText={participantPhone && !validParticipantPhone ? "טלפון לא תקין" : " "} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityRegId(null)}>ביטול</Button>
          <Button variant="contained" onClick={handleActivityRegister} disabled={!validParticipantName || !validParticipantPhone}>
            הרשמה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
