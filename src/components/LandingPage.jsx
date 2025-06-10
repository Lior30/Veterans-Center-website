// src/components/LandingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  useTheme,
  useMediaQuery,
  styled,
  Fade,
  Grow,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Info as InfoIcon,
  Article as ArticleIcon,
  Event as EventIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  LocationOn as LocationOnIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";

import MessageService from "../services/MessageService.js";
import Logo from "/logo.jpeg";
import SurveyService from "../services/SurveyService.js";
import ActivityService from "../services/ActivityService.js";
import FlyerService from "../services/FlyerService.js";
import UserService from "../services/UserService.js";
import IdentifyPage from "./IdentificationPage.jsx";
import CalendarPreview from "./CalendarPreview.jsx";
import ReplyContainer from "./ReplyContainer.jsx";
import SurveyDetailContainer from "./SurveyDetailContainer.jsx";

import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import FeatureCard from './FeatureCard';     // wherever you keep it
// import SectionTitle from './SectionTitle';   // likewise


// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#cce6f9",
  padding: theme.spacing(6, 0),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s",
  "&:hover": { transform: "translateY(-4px)" },
}));

const SectionTitle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  "& svg": { marginRight: theme.spacing(1), color: theme.palette.primary.main },
}));

const CtaButton = styled(Button)(({ theme, color }) => ({
  textTransform: "none",
  marginRight: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor:
    color === "primary"
      ? "#a8c13f"
      : color === "secondary"
      ? "#f07a3e"
      : "#005c9c",
  "&:hover": {
    backgroundColor:
      color === "primary"
        ? "#8ba536"
        : color === "secondary"
        ? "#d06533"
        : "#004a80",
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: "#005c9c",
  color: "#fff",
  padding: theme.spacing(6, 0),
}));

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data states
  const [flyers, setFlyers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [surveys, setSurveys] = useState([]);

  // UI states
  const [currentFlyer, setCurrentFlyer] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [dialog, setDialog] = useState({ type: "", data: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Registration form
  const [regInfo, setRegInfo] = useState({ name: "", phone: "" });
  const [regError, setRegError] = useState("");

  const moodImages = ["/image1.png", "/image2.png", "/image3.png"];

  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log('🔥 auth user is:', u);
      setUser(u);
    });
    return unsubscribe;
  }, [auth]);



  const [justIdentified, setJustIdentified] = useState(
    sessionStorage.getItem('justIdentified') === 'true'
  );
  const [openIdentify, setOpenIdentify] = useState(false);

  const handleIdentifySuccess = () => {
    console.log('[LandingPage] handleIdentifySuccess called');
    sessionStorage.setItem('justIdentified', 'true');
    setJustIdentified(true);
    setOpenIdentify(false);
    navigate('/');  // or '/', whatever route shows this page
  };


  // Fetch data once
  useEffect(() => {
    FlyerService.getActiveFlyers().then(setFlyers).catch(console.error);
    MessageService.listActive()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);
    SurveyService.list().then(setSurveys).catch(console.error);
    const unsub = ActivityService.subscribe((list) => {
      setActivities(list);
      setAvailableTags([...new Set(list.flatMap((a) => a.tags || []))]);
    });
    return () => unsub();
  }, []);

  // Mood carousel
  useEffect(() => {
    const id = setInterval(
      () => setImageIndex((i) => (i + 1) % moodImages.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  // Simple validation
  const validName = /^[A-Za-z\u0590-\u05FF ]+$/.test(regInfo.name.trim());
  const validPhone = UserService.isValidPhone(regInfo.phone.trim());

  // Handlers
  const handleNextFlyer = () =>
    setCurrentFlyer((i) => Math.min(i + 1, flyers.length - 1));
  const handlePrevFlyer = () =>
    setCurrentFlyer((i) => Math.max(i - 1, 0));
  const toggleTag = (tag) =>
    setSelectedTags((s) =>
      s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]
    );

  const upcoming = useCallback(() => {
    const now = Date.now(),
      week = now + 7 * 86400000;
    return activities.filter((a) => {
      const d = new Date(a.date).getTime();
      return (
        d >= now &&
        d <= week &&
        (selectedTags.length === 0 ||
          (a.tags || []).some((t) => selectedTags.includes(t)))
      );
    });
  }, [activities, selectedTags]);

  const openDialog = (type, data) => setDialog({ type, data });
  const closeDialog = () => setDialog({ type: "", data: null });

  const handleRegister = async () => {
    if (!validName || !validPhone)
      return setRegError("נא למלא שם וטלפון תקינים");
    try {
      const user = await UserService.findOrCreate({
        name: regInfo.name.trim(),
        phone: regInfo.phone.trim(),
      });
      await ActivityService.registerUser(dialog.data, {
        name: user.name,
        phone: user.phone,
      });
      setSnackbar({ open: true, message: "ההרשמה בוצעה בהצלחה" });
      closeDialog();
      setRegInfo({ name: "", phone: "" });
      setRegError("");
    } catch {
      setRegError("שגיאה, נסה שוב");
    }
  };

  return (
    <Box>
<AppBar position="static" color="transparent" elevation={0}>
  <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
    {/* לוגו בצד שמאל */}
   <Box
  component="img"
  src={Logo}
  alt="לוגו המרכז"
  sx={{
    height: { xs: 20, sm: 50 },   // 30px בטלפונים (xs), 50px בכל הגדלים הגדולים יותר
    cursor: "pointer"
  }}
  onClick={() => navigate("/")}
/>

    {/* אייקונים בצד ימין */}
    <Box>
      <IconButton color="primary"><EventIcon /></IconButton>
      <IconButton color="primary"><InfoIcon /></IconButton>
      <IconButton color="primary"><ArticleIcon /></IconButton>
      <IconButton color="primary"><FacebookIcon /></IconButton>
      <IconButton color="primary"><WhatsAppIcon /></IconButton>
      <IconButton color="primary"><PersonAddIcon /></IconButton>
    </Box>
  </Toolbar>
</AppBar>

      <HeroSection
  sx={{
    backgroundImage: `url('/image1.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: isMobile ? 300 : 500,
    position: "relative",
    display: "flex",
    alignItems: "center",
  }}
>
  {/* רקע כהה חצי-שקוף מעל התמונה */}
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 0,
    }}
  />

 

  {/* התוכן עצמה */}
  <Container sx={{ position: "relative", zIndex: 1 }}>
    <Grid container spacing={4} alignItems="center">
      <Grid item xs={12} md={6}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
        >
          מרכז ותיקים בית הכרם
        </Typography>
        <Typography sx={{ color: "#fff", mb: 3 }}>
          ברוכים הבאים למועדון שמביא לכם פעילויות, הרצאות ורווחה בכל יום!
        </Typography>
        <Box>
          {/* עדכון צבע כפתורים לניואנסים של ירוק וכתום מהתמונה */}
          <CtaButton
            color="primary"
            variant="contained"
            onClick={() => navigate("/subscribe")}
            sx={{
              backgroundColor: "#94c11f",
              "&:hover": { backgroundColor: "#7aa01a" },
            }}
          >
            רכשו מנוי חודשי
          </CtaButton>
          <CtaButton
            color="secondary"
            variant="contained"
            onClick={() => navigate("/register-workshop")}
            sx={{
              backgroundColor: "#f28c28",
              "&:hover": { backgroundColor: "#d27a21" },
            }}
          >
            הרשמה לסדנה
          </CtaButton>
          <CtaButton
            color="default"
            variant="contained"
            onClick={() => navigate("/home")}
            sx={{
              backgroundColor: "#005c9c",
              "&:hover": { backgroundColor: "#004a80" },
            }}
          >
            כניסה לניהול
          </CtaButton>
          <CtaButton
            color="default"
            variant="contained"
            onClick={() => setOpenIdentify(true)}
            sx={{
              backgroundColor: "#ffca28",       // bright yellow
              color: "#000",
              "&:hover": { backgroundColor: "#fbc02d" },
            }}
        >
          הזדהות
          </CtaButton>
        </Box>
      </Grid>
      {/* רווח בצד ימין */}
      <Grid item xs={12} md={6} />
    </Grid>
  </Container>
</HeroSection>

 <Container sx={{ py: 4, maxWidth: "100% !important" }}>
  <SectionTitle>
    <EventIcon />
    <Typography variant="h5">פליירים, לוח פעילויות והודעות</Typography>
  </SectionTitle>
  <Grid container spacing={4} alignItems="flex-start">
    
    {/* פליירים – צד שמאל */}
    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: "flex", justifyContent: "center" }}>
      <FeatureCard sx={{ p: 2, width: "100%", maxWidth: 480 }}>
        <CardActionArea onClick={() => openDialog("flyer", flyers[currentFlyer]?.activityId)}>
          <Box
            component="img"
            src={flyers[currentFlyer]?.fileUrl}
            alt="פלייר"
            sx={{
              width: "100%",
              height: { xs: 280, sm: 360, md: 500 },
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        </CardActionArea>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <IconButton onClick={handlePrevFlyer} disabled={currentFlyer === 0}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton onClick={handleNextFlyer} disabled={currentFlyer === flyers.length - 1}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </FeatureCard>
    </Grid>

    {/* קלנדר – אמצע */}
    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: "flex", justifyContent: "center" }}>
      <Fade in>
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <CalendarPreview activities={activities} />
        </Box>
      </Fade>
    </Grid>

    {/* הודעות – צד ימין */}
      <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
        <SectionTitle>
          <ArticleIcon />
          <Typography variant="h6">הודעות אחרונות</Typography>
        </SectionTitle>

        <Grid container spacing={2}>
          {messages.map((m) => (
            <Grid item xs={12} key={m.id}>
              <FeatureCard>
                <CardContent>
                  <Typography fontWeight="bold">{m.title}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {m.body?.slice(0, 80)}...
                  </Typography>

                  {/* only show “השב” if user is signed in */}
                  {justIdentified && (
                    <Button
                      size="small"
                      onClick={() => openDialog('message', m.id)}
                      sx={{ mt: 1 }}
                    >
                      השב
                    </Button>
                  )}
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Grid>
  </Grid>
</Container>


      {/* 4. Activities - פעילויות השבוע */}
      <Container sx={{ py: 4 }}>
        <SectionTitle>
          <EventIcon />
          <Typography variant="h5">פעילויות השבוע</Typography>
        </SectionTitle>
        <Box mb={2}>
          {availableTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => toggleTag(tag)}
              color={selectedTags.includes(tag) ? "secondary" : "default"}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        <Grid container spacing={2}>
          {upcoming().map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a.id}>
              <Grow in>
                <FeatureCard>
                  <CardContent>
                    <Typography variant="h6">{a.name}</Typography>
                    <Typography>
                      {a.date} | {a.startTime}–{a.endTime}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => openDialog("register", a.id)}
                    >
                      הרשמה
                    </Button>
                  </CardContent>
                </FeatureCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>


     {/* 5. Messages & Surveys */}
<Container sx={{ py: 4 }}>
  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <SectionTitle>
        <ArticleIcon />
        <Typography variant="h5">סקרים פתוחים</Typography>
      </SectionTitle>
      <Grid container spacing={2}>
        {surveys.map((s) => (
          <Grid item xs={12} sm={6} key={s.id}>
            <FeatureCard>
              <CardContent>
                <Typography noWrap>{s.headline}</Typography>
                {justIdentified && (
                  <Button size="small" onClick={() => openDialog("survey", s.id)}>
                    למילוי
                  </Button>
                )}
              </CardContent>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
    </Grid>
  </Grid>
</Container>

     
      {/* 7. Admin Button */}
      <Container sx={{ textAlign: "center", py: 4 }}>
        <Button variant="contained" size="large" onClick={() => navigate("/home")}>
          כניסה למערכת הניהול
        </Button>
      </Container>

      {/* 8. Dialogs */}
      <Dialog open={dialog.type === "register"} onClose={closeDialog} fullWidth>
        <DialogTitle>הרשמה לפעילות</DialogTitle>
        <DialogContent>
          {regError && <Alert severity="error">{regError}</Alert>}
          <TextField
            fullWidth
            label="שם"
            margin="normal"
            value={regInfo.name}
            onChange={(e) => setRegInfo((i) => ({ ...i, name: e.target.value }))}
          />
          <TextField
            fullWidth
            label="טלפון"
            margin="normal"
            value={regInfo.phone}
            onChange={(e) => setRegInfo((i) => ({ ...i, phone: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>ביטול</Button>
          <Button onClick={handleRegister}>שלח</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog.type === "message"} onClose={closeDialog} fullWidth>
        <DialogTitle>השב להודעה</DialogTitle>
        <DialogContent>
          <ReplyContainer messageId={dialog.data} onClose={closeDialog} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>סגור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog.type === "survey"} onClose={closeDialog} fullWidth>
        <DialogTitle>מילוי סקר</DialogTitle>
        <DialogContent>
          <SurveyDetailContainer surveyId={dialog.data} onClose={closeDialog} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>סגור</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />

      {/* 9. Footer */}
      <Footer>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center" mb={1}>
                <HomeIcon sx={{ mr: 1 }} /> מרכז ותיקים בית הכרם
              </Box>
              <Button sx={{ color: "#fff", textTransform: "none" }}>לחץ לכנס לאתר</Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">צרו קשר</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <PhoneIcon sx={{ mr: 1 }} /> 03-5250717
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <LocationOnIcon sx={{ mr: 1 }} /> בית הכרם
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <MailIcon sx={{ mr: 1 }} /> המייל של אסנת
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">מדיניות</Typography>
              <Box mt={1}>מדיניות פרטיות</Box>
              <Box>תנאי שימוש</Box>
              <Box>ביטול השתתפות</Box>
              <Box>הצהרת נגישות</Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1">קישורים</Typography>
              <Box mt={1}>הרצאות</Box>
              <Box>אודותינו</Box>
              <Box>התחברות</Box>
              <Box>צרו קשר</Box>
            </Grid>
          </Grid>
        </Container>
      </Footer>

       <Dialog
        open={openIdentify}
        onClose={() => setOpenIdentify(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>הזדהות</DialogTitle>
        <DialogContent>
          <IdentifyPage onSuccess={handleIdentifySuccess} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIdentify(false)}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
