// src/components/LandingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Info as InfoIcon,
  Event as EventIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

import FlyerService from "../services/FlyerService";
import MessageService from "../services/MessageService";
import SurveyService from "../services/SurveyService";
import ActivityService from "../services/ActivityService";
import UserService from "../services/UserService";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import CtaButton from "./CtaButton";
import FlyersSection from "./FlyersSection";
import MessagesSection from "./MessagesSection";
import CalendarPreview from "./CalendarPreview";
import SurveySection from "./SurveySection";
import LandingDialogs from "./LandingDialogs";
import FooterSection from "./FooterSection";

const HeroSection = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      component="section"
      sx={{
        backgroundImage: "url('/image1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />
      <Container sx={{ position: "relative", zIndex: 1 }}>{children}</Container>
    </Box>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data states
  const [flyers, setFlyers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // UI/dialog states
  const [infoOpen, setInfoOpen] = useState(false);
  const [dialog, setDialog] = useState({ type: "", data: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, activityId: null });
  const [openMyActivities, setOpenMyActivities] = useState(false);
  const [myActivities, setMyActivities] = useState([]);
  const [openIdentify, setOpenIdentify] = useState(false);
  const [openAdminSignIn, setOpenAdminSignIn] = useState(false);
  const [justIdentified, setJustIdentified] = useState(
    sessionStorage.getItem("justIdentified") === "true"
  );

  const auth = getAuth();
  const calendarRef = useRef();

  // fetch data once
  useEffect(() => {
    FlyerService.getActiveFlyers().then(setFlyers).catch(console.error);
    MessageService.listActive()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);
    SurveyService.list().then(setSurveys).catch(console.error);
    const unsub = ActivityService.subscribe((list) => setActivities(list));
    return () => unsub();
  }, []);

  // load user from session storage
  useEffect(() => {
    const phone = sessionStorage.getItem("userPhone");
    if (phone) {
      UserService.get(phone).then((u) => u && setUserProfile(u));
    }
  }, []);

  // firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUserProfile);
    return unsubscribe;
  }, [auth]);

  // when opening "my activities", fetch
  useEffect(() => {
    if (openMyActivities && userProfile?.id) {
      ActivityService.getUserActivities(userProfile.id)
        .then(setMyActivities)
        .catch(console.error);
    }
  }, [openMyActivities, userProfile]);

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openDialog = (type, data) => setDialog({ type, data });
  const closeDialog = () => setDialog({ type: "", data: null });

  const confirmCancelRegistration = async () => {
    if (!cancelDialog.activityId || !userProfile?.phone) return;
    try {
      await ActivityService.removeUser(cancelDialog.activityId, {
        phone: userProfile.phone,
        name: userProfile.name,
      });
      setMyActivities((prev) =>
        prev.filter((a) => a.id !== cancelDialog.activityId)
      );
      setCancelDialog({ open: false, activityId: null });
    } catch (err) {
      console.error("Error cancelling registration", err);
    }
  };

  const handleIdentifySuccess = async () => {
    sessionStorage.setItem("justIdentified", "true");
    setJustIdentified(true);
    setOpenIdentify(false);
    const phone = sessionStorage.getItem("userPhone");
    if (phone) {
      const u = await UserService.get(phone);
      u && setUserProfile(u);
    }
  };

  return (
    <Box sx={{ overflowX: "hidden", backgroundColor: theme.palette.background.default }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: theme.palette.background.paper }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            component="img"
            src="/logo.jpeg"
            alt="לוגו"
            sx={{ height: { xs: 20, sm: 50 }, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
          <Box>
            <IconButton
              color="inherit"
              component="a"
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: theme.palette.text.primary }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => setInfoOpen(true)}
              sx={{ color: theme.palette.text.primary }}
            >
              <InfoIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={scrollToCalendar}
              sx={{ color: theme.palette.text.primary }}
            >
              <EventIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <HeroSection>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{
                color: theme.palette.primary.contrastText,
                fontWeight: 700,
                mb: 2,
              }}
            >
              מרכז ותיקים בית הכרם
            </Typography>
            {userProfile?.first_name && (
              <Typography
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "1.6rem", sm: "2rem" },
                }}
              >
                שלום {userProfile.first_name}!
              </Typography>
            )}
            <Typography
              sx={{
                color: theme.palette.primary.contrastText,
                mb: 3,
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              ברוכים הבאים למועדון שמביא לכם פעילויות, הרצאות ורווחה בכל יום!
            </Typography>
            <Box>
              {!userProfile?.first_name && (
                <CtaButton color="default" onClick={() => setOpenIdentify(true)}>
                  הזדהות
                </CtaButton>
              )}
              <CtaButton
                color="secondary"
                component="a"
                href="https://wa.me/0523705021"
              >
                צור קשר בוואטסאפ
              </CtaButton>
              <CtaButton color="primary" component="a" href="tel:0523705021">
                התקשר
              </CtaButton>
              {userProfile?.id && (
                <CtaButton onClick={() => setOpenMyActivities(true)}>
                  הפעילויות שלי
                </CtaButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Sections */}
      <FlyersSection flyers={flyers} openDialog={openDialog} />
      <MessagesSection
        messages={messages}
        justIdentified={justIdentified}
        onReadMore={openDialog}
      />
      <Box ref={calendarRef}>
        <CalendarPreview
          openDialog={openDialog}
          userProfile={userProfile}
          setOpenIdentify={setOpenIdentify}
        />
      </Box>
      <SurveySection
        surveys={surveys}
        justIdentified={justIdentified}
        onFillSurvey={(id) => openDialog("survey", id)}
        onViewAllSurveys={() => openDialog("all-surveys")}
      />

      {/* Dialogs & Footer */}
      <LandingDialogs
        infoOpen={infoOpen}
        setInfoOpen={setInfoOpen}
        cancelDialog={cancelDialog}
        setCancelDialog={setCancelDialog}
        confirmCancelRegistration={confirmCancelRegistration}
        openMyActivities={openMyActivities}
        setOpenMyActivities={setOpenMyActivities}
        myActivities={myActivities}
        dialog={dialog}
        openDialog={openDialog}
        closeDialog={closeDialog}
        messages={messages}
        activities={activities}
        surveys={surveys}
        userProfile={userProfile}
        justIdentified={justIdentified}
        openIdentify={openIdentify}
        setOpenIdentify={setOpenIdentify}
        openAdminSignIn={openAdminSignIn}
        setOpenAdminSignIn={setOpenAdminSignIn}
        handleIdentifySuccess={handleIdentifySuccess}
      />
      <FooterSection
        onScrollTop={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        onOpenInfo={() => setInfoOpen(true)}
        onOpenIdentify={() => setOpenIdentify(true)}
        onOpenAdmin={() => setOpenAdminSignIn(true)}
      />
    </Box>
  );
}
