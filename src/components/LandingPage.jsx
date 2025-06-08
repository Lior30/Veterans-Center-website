// ==================  src/components/LandingPage.jsx  ==================
import React, { useState, useEffect, useCallback } from "react";
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
  Fade,
  Snackbar,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon   from "@mui/icons-material/Close";
import EventIcon   from "@mui/icons-material/Event";

import MessageService  from "../services/MessageService.js";
import SurveyService   from "../services/SurveyService.js";
import ActivityService from "../services/ActivityService.js";
import FlyerService    from "../services/FlyerService.js";
import UserService     from "../services/UserService.js";

import CalendarPreview         from "./CalendarPreview.jsx";
import ReplyContainer          from "./ReplyContainer.jsx";
import SurveyDetailContainer   from "./SurveyDetailContainer.jsx";

export default function LandingPage() {
  const navigate   = useNavigate();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down("sm"));

  /* ─────────────────────  state  ───────────────────── */
  const [messages,  setMessages]        = useState([]);
  const [surveys,   setSurveys]         = useState([]);
  const [activities,setActivities]      = useState([]);
  const [flyers,    setFlyers]          = useState([]);

  const [selectedFlyerIndex, setSelectedFlyerIndex] = useState(0);
  const selectedFlyer       = flyers[selectedFlyerIndex] || null;
  const [flyerDialogOpen,   setFlyerDialogOpen]   = useState(false);

  const [activityRegId,     setActivityRegId]     = useState(null);
  const [participantName,   setParticipantName]   = useState("");
  const [participantPhone,  setParticipantPhone]  = useState("");
  const [participantErr,    setParticipantErr]    = useState("");

  const [selectedMsg,       setSelectedMsg]       = useState(null);
  const [selectedSurvey,    setSelectedSurvey]    = useState(null);
  const [selectedActivity,  setSelectedActivity]  = useState(null);

  const [snackbarOpen,      setSnackbarOpen]      = useState(false);

  /* תצוגת “אווירה” מתחלפת */
  const moodImages = ["/image1.png", "/image2.png", "/image3.png"];
  const [imageIndex, setImageIndex] = useState(0);

  /* תגיות סינון פעילויות */
  const [selectedTags,  setSelectedTags]  = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [anchorEl,      setAnchorEl]      = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleOpenMenu  = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  /* ─────────────────────  פעילות / תגיות  ───────────────────── */
  useEffect(() => {
    const unsub = ActivityService.subscribe((list) => {
      setActivities(list);
      const tags = Array.from(new Set(list.flatMap((a) => a.tags || [])));
      setAvailableTags(tags);
    });
    return () => unsub();
  }, []);

  /* ─────────────────────  תמונות אווירה  ───────────────────── */
  useEffect(() => {
    const interval = setInterval(
      () => setImageIndex((i) => (i + 1) % moodImages.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────  הודעות • סקרים • פלייארים  ───────────────────── */
  useEffect(() => {
    MessageService.listActive()          // ← משתמשים בלוגיקה החדשה
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);

    SurveyService.list()
      .then(setSurveys)
      .catch(console.error);

    FlyerService.getActiveFlyers()       // ← משתמשים בלוגיקה החדשה
      .then(setFlyers)
      .catch(console.error);
  }, []);

  /* ─────────────────────  הרשמה לפעילות  ───────────────────── */
  const validParticipantName  =
    /^[A-Za-z\u0590-\u05FF\s]+$/.test(participantName.trim());
  const validParticipantPhone =
    UserService.isValidPhone(participantPhone.trim());

  const handleActivityRegister = async () => {
    if (!validParticipantName || !validParticipantPhone) {
      setParticipantErr("שם חייב אותיות בלבד, טלפון תקין (05XXXXXXXX)");
      return;
    }
    try {
      const user = await UserService.findOrCreate({
        name : participantName.trim(),
        phone: participantPhone.trim(),
      });
      await ActivityService.registerUser(activityRegId, {
        name : user.name,
        phone: user.phone,
      });
      setSnackbarOpen(true);
      setActivityRegId(null);
      setParticipantName("");
      setParticipantPhone("");
      setParticipantErr("");
    } catch (e) {
      console.error("Registration error:", e);
      setParticipantErr("שגיאה בהרשמה, נסה/י שוב");
    }
  };

  /* ─────────────────────  פעילויות בשבוע הקרוב + סינון תגיות ───────────────────── */
  const getUpcomingWeekActivities = useCallback(() => {
    const now   = new Date();
    const week  = new Date(now);
    week.setDate(now.getDate() + 7);

    return activities.filter((a) => {
      const d       = new Date(a.date);
      const inWeek  = d >= now && d <= week;
      const hasTag  =
        selectedTags.length === 0 ||
        (a.tags || []).some((t) => selectedTags.includes(t));
      return inWeek && hasTag;
    });
  }, [activities, selectedTags]);

  /* ─────────────────────  Render  ───────────────────── */
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ------------------------------------------------- כותרת */}
      <Fade in timeout={800}>
        <Box
          sx={{
            display       : "flex",
            alignItems    : "center",
            justifyContent: "center",
            mb            : 2,
            gap           : 2,
            flexDirection : isMobile ? "column" : "row",
          }}
        >
          <Typography variant="h3" color="primary.main" textAlign="center">
            מרכז ותיקים בית הכרם
          </Typography>
          <Box
            component="img"
            src="/logo.jpeg"
            alt="לוגו"
            sx={{ height: isMobile ? 40 : 60 }}
          />
        </Box>
      </Fade>

      {/* ------------------------------------------------- פלייארים + תמונות אווירה */}
      <Box
        sx={{
          mt            : 2,
          display       : "flex",
          flexDirection : isMobile ? "column" : "row",
          justifyContent: "center",
          gap           : 2,
        }}
      >
        {/* --------- פלייארים */}
        <Card sx={{ flex: 1, p: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            {selectedFlyer ? (
              <>
                <Box
                  component="img"
                  src={selectedFlyer.fileUrl}
                  alt={selectedFlyer.name}
                  sx={{
                    width      : "100%",
                    maxWidth   : 320,
                    borderRadius: 2,
                    boxShadow  : 3,
                    cursor     : "pointer",
                    mb         : 2,
                    transition : "0.3s",
                    "&:hover"  : { transform: "scale(1.03)" },
                  }}
                  onClick={() => setFlyerDialogOpen(true)}
                />
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <Button
                    variant="outlined"
                    disabled={selectedFlyerIndex === 0}
                    onClick={() =>
                      setSelectedFlyerIndex((i) => i - 1)
                    }
                  >
                    הקודם
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={selectedFlyerIndex === flyers.length - 1}
                    onClick={() =>
                      setSelectedFlyerIndex((i) => i + 1)
                    }
                  >
                    הבא
                  </Button>
                </Box>
              </>
            ) : (
              <Typography>אין פליירים להצגה.</Typography>
            )}
          </CardContent>
        </Card>

        {/* --------- תמונות אווירה */}
        <Card sx={{ flex: 1, p: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              תמונות אווירה
            </Typography>
            <Box
              component="img"
              src={moodImages[imageIndex]}
              alt={`תמונת אווירה ${imageIndex + 1}`}
              sx={{
                width      : "100%",
                maxWidth   : 320,
                borderRadius: 2,
                boxShadow  : 3,
                transition : "0.5s ease-in-out",
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* ------------------------------------------------- פעילויות השבוע */}
      <Fade in timeout={1000}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography
              variant="h5"
              color="primary.main"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <EventIcon /> פעילויות השבוע
            </Typography>

            {/* סינון תגיות */}
            <Box
              sx={{
                mb      : 2,
                display : "flex",
                gap     : 1,
                flexWrap: "wrap",
              }}
            >
              <Button variant="outlined" onClick={handleOpenMenu}>
                סנן לפי תגית
              </Button>
              {selectedTags.length > 0 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setSelectedTags([])}
                >
                  ביטול סינון
                </Button>
              )}
              <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
                {availableTags.map((tag) => (
                  <MenuItem
                    key={tag}
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    selected={selectedTags.includes(tag)}
                  >
                    {tag}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* כרטיסיות פעילות */}
            <Box
              sx={{
                display      : "flex",
                flexDirection: isMobile ? "column" : "row",
                overflowX    : isMobile ? "visible" : "auto",
                gap          : 2,
              }}
            >
              {getUpcomingWeekActivities().length > 0 ? (
                getUpcomingWeekActivities().map((a) => (
                  <Card
                    key={a.id}
                    sx={{
                      minWidth      : isMobile ? "100%" : 260,
                      p             : 2,
                      backgroundColor: "#faf5fb",
                      border        : "1px solid #91278F",
                    }}
                  >
                    <Typography variant="h6" color="primary.main">
                      {a.name}
                    </Typography>
                    <Typography variant="body2">תאריך: {a.date}</Typography>
                    <Typography variant="body2">
                      שעה: {a.startTime} - {a.endTime}
                    </Typography>
                    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedActivity(a)}
                      >
                        פרטים
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setActivityRegId(a.id)}
                      >
                        הרשמה
                      </Button>
                    </Box>
                  </Card>
                ))
              ) : (
                <Typography>אין פעילויות מתוכננות לשבוע הקרוב.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* ------------------------------------------------- הודעות + סקרים */}
      <Grid
        container
        spacing={4}
        sx={{ mt: 4, flexDirection: isMobile ? "column" : "row" }}
      >
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* ---- הודעות ---- */}
            <Grow in timeout={500}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="primary.main" gutterBottom>
                    הודעות אחרונות
                  </Typography>
                  {messages.length > 0 ? (
                    <Box sx={{ display: "flex", overflowX: "auto", gap: 2 }}>
                      {messages.map((m) => (
                        <Card
                          key={m.id}
                          sx={{
                            minWidth  : 220,
                            p         : 2,
                            flexShrink: 0,
                            transition: "0.3s",
                            "&:hover" : { boxShadow: 6 },
                          }}
                        >
                          <Typography variant="h6">{m.title}</Typography>
                          <Typography variant="body2">{m.body}</Typography>
                          <Button
                            size="small"
                            sx={{ mt: 1 }}
                            variant="outlined"
                            onClick={() => setSelectedMsg(m)}
                          >
                            השב
                          </Button>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography>אין הודעות להצגה.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>

            {/* ---- סקרים ---- */}
            <Grow in timeout={800}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="primary.main" gutterBottom>
                    סקרים פתוחים
                  </Typography>
                  {surveys.length > 0 ? (
                    <Box sx={{ display: "flex", overflowX: "auto", gap: 2 }}>
                      {surveys.map((s) => (
                        <Card
                          key={s.id}
                          sx={{
                            minWidth  : 240,
                            p         : 2,
                            flexShrink: 0,
                            display   : "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "0.3s",
                            "&:hover" : { boxShadow: 6 },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                            noWrap
                            title={s.headline}
                          >
                            סקר: {s.headline || "ללא שם"}
                          </Typography>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setSelectedSurvey(s)}
                          >
                            למילוי הסקר
                          </Button>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography>אין סקרים זמינים כעת.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Stack>
        </Grid>
      </Grid>

      {/* ------------------------------------------------- לוח שנה */}
      <Fade in timeout={1000}>
        <Card sx={{ mt: 6 }}>
          <CardContent>
            <Typography variant="h5" color="primary.main" gutterBottom>
              לוח אירועים
            </Typography>
            <Box sx={{ pt: 2 }}>
              <CalendarPreview activities={activities} />
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* ------------------------------------------------- כפתור ניהול */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            px          : 6,
            py          : 1.5,
            fontWeight  : 700,
            borderRadius: 10,
            boxShadow   : 3,
            background  : "linear-gradient(90deg, #91278F 0%, #D81B60 100%)",
            color       : "white",
            "&:hover"   : {
              background:
                "linear-gradient(90deg, #7a1e78 0%, #b1144e 100%)",
            },
          }}
          onClick={() => navigate("/home")}
        >
          כניסה למערכת הניהול
        </Button>
      </Box>

      {/* ------------------------------------------------- דיאלוגים */}
      {/* 1. פרטי פעילות */}
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

      {/* 2. צפייה מלאה בפלייר */}
      <Dialog
        open={flyerDialogOpen}
        onClose={() => setFlyerDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedFlyer?.name}
          <Button
            onClick={() => setFlyerDialogOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                const activity = activities.find(
                  (a) => a.id === selectedFlyer?.activityId
                );
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
              onClick={() => {
                setFlyerDialogOpen(false);
                setActivityRegId(selectedFlyer?.activityId || "flyer");
              }}
            >
              להרשמה
            </Button>
          </Stack>
          <Box
            component="img"
            src={selectedFlyer?.fileUrl}
            alt={selectedFlyer?.name}
            sx={{ width: "100%", borderRadius: 2 }}
          />
        </DialogContent>
      </Dialog>

      {/* 3. השבת הודעה */}
      <Dialog
        open={Boolean(selectedMsg)}
        onClose={() => setSelectedMsg(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>השב להודעה: {selectedMsg?.title}</DialogTitle>
        <DialogContent dividers>
          <ReplyContainer
            messageId={selectedMsg?.id}
            onClose={() => setSelectedMsg(null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMsg(null)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* 4. מילוי סקר */}
      <Dialog
        open={Boolean(selectedSurvey)}
        onClose={() => setSelectedSurvey(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>מילוי סקר: {selectedSurvey?.headline}</DialogTitle>
        <DialogContent dividers>
          <SurveyDetailContainer
            surveyId={selectedSurvey?.id}
            onClose={() => setSelectedSurvey(null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSurvey(null)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* 5. הרשמה לפעילות */}
      <Dialog
        open={Boolean(activityRegId)}
        onClose={() => setActivityRegId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>הרשמה לפעילות</DialogTitle>
        <DialogContent>
          {participantErr && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {participantErr}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם מלא"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              fullWidth
              error={participantName && !validParticipantName}
              helperText={
                participantName && !validParticipantName
                  ? "אותיות ורווחים בלבד"
                  : " "
              }
            />
            <TextField
              label="טלפון"
              value={participantPhone}
              onChange={(e) => setParticipantPhone(e.target.value)}
              fullWidth
              error={participantPhone && !validParticipantPhone}
              helperText={
                participantPhone && !validParticipantPhone
                  ? "טלפון לא תקין"
                  : " "
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityRegId(null)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleActivityRegister}
            disabled={!validParticipantName || !validParticipantPhone}
          >
            הרשמה
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------- Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="ההרשמה לפעילות בוצעה בהצלחה!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
}
