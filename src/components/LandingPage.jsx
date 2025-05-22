// src/components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
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
  Alert
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

  const [flyerRegId, setFlyerRegId] = useState(null);
  const [flyerName, setFlyerName] = useState("");
  const [flyerPhone, setFlyerPhone] = useState("");
  const [flyerErr, setFlyerErr] = useState("");

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

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

  const validFlyerName = /^[A-Za-z\u0590-\u05FF\s]+$/.test(flyerName.trim());
  const validFlyerPhone = UserService.isValidPhone(flyerPhone.trim());

  const handleFlyerRegister = async () => {
    if (!validFlyerName || !validFlyerPhone) {
      setFlyerErr("שם חייב אותיות בלבד, טלפון תקין (05XXXXXXXX)");
      return;
    }
    try {
      const user = await UserService.findOrCreate({
        name: flyerName.trim(),
        phone: flyerPhone.trim(),
      });
      await ActivityService.registerUser(flyerRegId, user.id);
      alert("ההרשמה לפלייר בוצעה בהצלחה!");
      setFlyerRegId(null);
    } catch (e) {
      console.error(e);
      setFlyerErr("שגיאה בהרשמה, נסי שוב");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" align="center" color="primary.main" gutterBottom>
        מרכז ותיקים בית הכרם
      </Typography>

      <Grid container spacing={4} sx={{ flexWrap: "nowrap" }}>
        {/* Messages + Surveys (שמאל) */}
        <Grid item md={8}>
          <Stack spacing={4}>
            <Paper>
              <Typography variant="h5" color="secondary.main" sx={{ p: 2 }}>
                הודעות אחרונות
              </Typography>
              <Box sx={{ display: "flex", overflowX: "auto", p: 2, "&::-webkit-scrollbar": { display: "none" } }}>
                {messages.slice(0, 5).map(m => (
                  <Paper key={m.id} elevation={1} sx={{ minWidth: 200, mr: 2, p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>{m.title}</Typography>
                    <Typography variant="body2">{m.body}</Typography>
                    <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedMsg(m)}>
                      השב
                    </Button>
                  </Paper>
                ))}
              </Box>
            </Paper>

            <Paper>
              <Typography variant="h5" color="secondary.main" sx={{ p: 2 }}>
                סקרים פתוחים
              </Typography>
              <Box sx={{ display: "flex", overflowX: "auto", p: 2, "&::-webkit-scrollbar": { display: "none" } }}>
                {surveys.slice(0, 5).map(s => (
                  <Paper key={s.id} elevation={1} sx={{ minWidth: 200, mr: 2, p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>{s.title}</Typography>
                    <Button variant="contained" size="small" onClick={() => setSelectedSurvey(s)}>
                      למילוי הסקר
                    </Button>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Flyer (ימין) */}
        <Grid item md={4}>
          {selectedFlyer && (
            <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
              <Box
                component="img"
                src={selectedFlyer.fileUrl}
                alt={selectedFlyer.name}
                sx={{ width: "100%", maxWidth: "300px", borderRadius: 2, boxShadow: 3, cursor: "pointer", mb: 2 }}
                onClick={() => setFlyerRegId(selectedFlyer.id)}
              />
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={selectedFlyerIndex === 0}
                  onClick={() => setSelectedFlyerIndex(i => i - 1)}
                >
                  הקודם
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={selectedFlyerIndex === flyers.length - 1}
                  onClick={() => setSelectedFlyerIndex(i => i + 1)}
                >
                  הבא
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* לוח שנה */}
      <Paper sx={{ mt: 6 }}>
        <Typography variant="h5" color="secondary.main" sx={{ p: 2 }}>
          לוח אירועים
        </Typography>
        <Box sx={{ p: 2 }}>
          <CalendarPreview activities={activities} />
        </Box>
      </Paper>

      {/* Admin Login */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button variant="contained" size="large" onClick={() => navigate("/home")}>כניסה למערכת הניהול</Button>
      </Box>

      {/* Reply Dialog */}
      <Dialog open={Boolean(selectedMsg)} onClose={() => setSelectedMsg(null)} fullWidth maxWidth="sm">
        <DialogTitle>השב להודעה: {selectedMsg?.title}</DialogTitle>
        <DialogContent dividers>
          <ReplyContainer messageId={selectedMsg?.id} onClose={() => setSelectedMsg(null)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedMsg(null)}>סגור</Button></DialogActions>
      </Dialog>

      {/* Survey Dialog */}
      <Dialog open={Boolean(selectedSurvey)} onClose={() => setSelectedSurvey(null)} fullWidth maxWidth="sm">
        <DialogTitle>מילוי סקר: {selectedSurvey?.title}</DialogTitle>
        <DialogContent dividers>
          <SurveyDetailContainer surveyId={selectedSurvey?.id} onClose={() => setSelectedSurvey(null)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedSurvey(null)}>סגור</Button></DialogActions>
      </Dialog>

      {/* Flyer Registration Dialog */}
      <Dialog open={Boolean(flyerRegId)} onClose={() => setFlyerRegId(null)} fullWidth maxWidth="sm">
        <DialogTitle>הרשמה לפלייר</DialogTitle>
        <DialogContent>
          {flyerErr && <Alert severity="error" sx={{ mb: 2 }}>{flyerErr}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם מלא"
              value={flyerName}
              onChange={e => setFlyerName(e.target.value)}
              fullWidth
              error={flyerName && !validFlyerName}
              helperText={flyerName && !validFlyerName ? "אותיות ורווחים בלבד" : " "}
            />
            <TextField
              label="טלפון"
              value={flyerPhone}
              onChange={e => setFlyerPhone(e.target.value)}
              fullWidth
              error={flyerPhone && !validFlyerPhone}
              helperText={flyerPhone && !validFlyerPhone ? "טלפון לא תקין" : " "}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlyerRegId(null)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleFlyerRegister}
            disabled={!validFlyerName || !validFlyerPhone}
          >
            הרשמה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
