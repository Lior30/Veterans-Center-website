// src/components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate }                from "react-router-dom";
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
  DialogActions
} from "@mui/material";

import MessageService          from "../services/MessageService.js";
import SurveyService           from "../services/SurveyService.js";
import ActivityService         from "../services/ActivityService.js";
import FlyerService            from "../services/FlyerService.js";
import CalendarPreview         from "./CalendarPreview.jsx";
import SurveyDetailContainer   from "./SurveyDetailContainer.jsx";

export default function LandingPage() {
  const navigate = useNavigate();
  const [messages, setMessages]         = useState([]);
  const [surveys, setSurveys]           = useState([]);
  const [activities, setActivities]     = useState([]);
  const [flyers, setFlyers]             = useState([]);
  const [selectedFlyer, setSelectedFlyer]   = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    // Load messages
    MessageService.list()
      .then(ms => setMessages(ms.filter(m => !m.activityId)))
      .catch(console.error);

    // Load surveys
    SurveyService.list()
      .then(setSurveys)
      .catch(console.error);

    // Subscribe to activities
    const unsubscribe = ActivityService.subscribe(list => setActivities(list));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load flyers
    FlyerService.getFlyers()
      .then(setFlyers)
      .catch(console.error);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Main title */}
      <Typography variant="h3" align="center" color="primary.main" gutterBottom>
        מרכז ותיקים בית הכרם
      </Typography>

      {/* Flyers carousel */}
      {flyers.length > 0 && (
        <Paper
          elevation={0}
          sx={{ display:"flex", overflowX:"auto", py:2, mb:4, "&::-webkit-scrollbar": { display:"none" } }}
        >
          {flyers.map(f => (
            <Box
              key={f.id}
              component="img"
              src={f.fileUrl}
              alt={f.name}
              sx={{ height:300, flexShrink:0, mx:1, borderRadius:2, cursor:"pointer", boxShadow:3 }}
              onClick={() => setSelectedFlyer(f)}
            />
          ))}
        </Paper>
      )}

      <Grid container spacing={4}>
        {/* Messages horizontally */}
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h5" color="secondary.main" sx={{ p:2 }}>
              הודעות אחרונות
            </Typography>
            <Box sx={{ display:"flex", overflowX:"auto", p:2, "&::-webkit-scrollbar": { display:"none" } }}>
              {messages.slice(0,5).map(m => (
                <Paper key={m.id} elevation={1} sx={{ minWidth:200, mr:2, p:2, borderRadius:2 }}>
                  <Typography variant="subtitle1" gutterBottom>{m.title}</Typography>
                  <Typography variant="body2">{m.body}</Typography>
                  <Button size="small" sx={{ mt:1 }} onClick={() => navigate(`/messages/reply/${m.id}`)}>השב</Button>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Surveys horizontally, open fill dialog */}
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h5" color="secondary.main" sx={{ p:2 }}>
              סקרים פתוחים
            </Typography>
            <Box sx={{ display:"flex", overflowX:"auto", p:2, "&::-webkit-scrollbar": { display:"none" } }}>
              {surveys.slice(0,5).map(s => (
                <Paper key={s.id} elevation={1} sx={{ minWidth:200, mr:2, p:2, borderRadius:2 }}>
                  <Typography variant="subtitle1" gutterBottom>{s.title}</Typography>
                  <Button variant="contained" size="small" onClick={() => setSelectedSurvey(s)}>
                    למילוי הסקר
                  </Button>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Calendar */}
      <Paper sx={{ mt:6 }}>
        <Typography variant="h5" color="secondary.main" sx={{ p:2 }}>
          לוח אירועים
        </Typography>
        <Box sx={{ p:2 }}>
          <CalendarPreview activities={activities} />
        </Box>
      </Paper>

      {/* Admin login button */}
      <Box sx={{ display:"flex", justifyContent:"center", mt:4 }}>
        <Button variant="contained" size="large" onClick={() => navigate("/home")}>
          כניסה למערכת הניהול
        </Button>
      </Box>

      {/* Survey fill dialog */}
      <Dialog
        open={Boolean(selectedSurvey)}
        onClose={() => setSelectedSurvey(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedSurvey?.title}</DialogTitle>
        <DialogContent dividers>
          <SurveyDetailContainer id={selectedSurvey?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSurvey(null)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* Flyer detail dialog */}
      <Dialog
        open={Boolean(selectedFlyer)}
        onClose={() => setSelectedFlyer(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedFlyer?.name}</DialogTitle>
        <DialogContent dividers>
          <Box component="img" src={selectedFlyer?.fileUrl} alt={selectedFlyer?.name} sx={{ width:"100%" }} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => navigate(`/flyers/register/${selectedFlyer.id}`)}>
            הרשמה
          </Button>
          <Button onClick={() => setSelectedFlyer(null)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
