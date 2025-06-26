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
import LandingNavBar from "./LandingNavBar";
import MoodSection from "./MoodSection";
import HeroSection from "./HeroSection";



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
  const flyersRef     = useRef();
const messagesRef   = useRef();
const surveysRef    = useRef();


useEffect(() => {
  let allActivities = [];

  // getting activities from service
  const activitiesUnsub = ActivityService.subscribe((list) => {
    allActivities = list;
    setActivities(list);
  });

  // getting flyers from service
  const flyersUnsub = FlyerService.subscribe((flyersData) => {
    const now = new Date();
    const activitiesById = Object.fromEntries(allActivities.map((a) => [a.id, a]));

    const activeFlyers = flyersData
      .filter((f) => {
        const start = f.startDate?.toDate?.() ?? new Date(0);
        const end = f.endDate?.toDate?.() ?? new Date("9999-12-31");
        return start <= now && now <= end;
      })
      .map((f) => ({
        ...f,
        activityDate: activitiesById[f.activityId]?.date || null,
      }));

    setFlyers(activeFlyers);
  });


  SurveyService.list().then(setSurveys).catch(console.error);

  return () => {
    flyersUnsub();
    activitiesUnsub();
  };
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

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const allMessages = await MessageService.listActive();

        if (!userProfile || !userProfile.id) {
          // user not identified, show all messages without activity filter
          setMessages(allMessages.filter((m) => !m.activityId));
        } else {
          const acts = await ActivityService.getUserActivities(userProfile.id);
          setMyActivities(acts);
          const actIds = acts.map((a) => a.id);
          const visibleMessages = allMessages.filter(
            (m) => !m.activityId || actIds.includes(m.activityId)
          );
          setMessages(visibleMessages);
        }
      } catch (err) {
        console.error("שגיאה בטעינת הודעות:", err);
      }
    };

    loadMessages();
  }, [userProfile]);

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToFlyers   = () => flyersRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToMessages = () => messagesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToSurveys  = () => surveysRef.current?.scrollIntoView({ behavior: "smooth" });
  const openDialog = (type, data) => setDialog({ type, data });
  const closeDialog = () => setDialog({ type: "", data: null });

  const confirmCancelRegistration = async () => {
  if (!cancelDialog.activityId || !userProfile?.phone) return;

  try {
    // 1. download activity from service
    await ActivityService.removeUser(cancelDialog.activityId, {
      phone: userProfile.phone,
      name: userProfile.name,
    });

    // 2. activity name
    const act = activities.find((a) => a.id === cancelDialog.activityId);
    const actName = act?.name;

    // 3. takedown from user profile
    if (actName) {
      await UserService.removeActivity(userProfile.phone, actName);
    }

    // 4. update local state
    setUserProfile((prev) => ({
      ...prev,
      activities: prev.activities.filter((n) => n !== actName),
    }));

    
    setCancelDialog({ open: false, activityId: null });
  } catch (err) {
    console.error("Error cancelling registration", err);
    alert("אירעה שגיאה בביטול ההרשמה");
  }
};
/** reterns by name and not id */
const getActivityName = (idOrName) => {
  //search by id and return name
  const act = activities.find((a) => a.id === idOrName);
  return act ? act.name : idOrName;
};

const handleFillSurvey = (survey) => {
  const tagRaw = (survey.of_activity || "").trim();   // what we get from the survey
  const tag = getActivityName(tagRaw);                // transform to name

  // general survey, no tag
  if (!tag || tag === "כללי") {
    openDialog("survey", survey.id);
    return;
  }

  // list of activities in user profile
  const acts = (userProfile?.activities || []).map((s) => s.trim());

  if (acts.includes(tag)) {
    openDialog("survey", survey.id);                  
  } else {
    alert(`הסקר מיועד רק למשתתפי הפעילות: ${tag}`);
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
  <Box sx={{ overflowX: "hidden", backgroundColor: "#fff" }}>
    {/* Navigation Bar */}
    <LandingNavBar
      onScrollToActivities={scrollToCalendar}
      onScrollToFlyers={scrollToFlyers}
      onScrollToSurveys={scrollToSurveys}
      onScrollToMessages={scrollToMessages}
        justIdentified={justIdentified}

    />

  <HeroSection
  userProfile={userProfile}
  onOpenIdentify={() => setOpenIdentify(true)}
  onOpenMyActivities={() => setOpenMyActivities(true)}
/>


 {/* Messages */}
<Box ref={messagesRef}>
  <MessagesSection
    messages={messages}
    justIdentified={justIdentified}
    openDialog={openDialog}
  />
</Box>

    {/* Flyers */}
    <Box ref={flyersRef}>
<FlyersSection flyers={flyers} activities={activities} openDialog={openDialog} />
    </Box>

  
    {/* Calendar (Activities) */}
{/* Calendar (Activities) */}
<Box
  id="calendar-view"    
  tabIndex={-1}         
  ref={calendarRef}
>
  <CalendarPreview
    openDialog={openDialog}
    userProfile={userProfile}
    setOpenIdentify={setOpenIdentify}
    activities={activities}
    flyers={flyers}
  />
</Box>


    {/* Surveys */}
    <Box ref={surveysRef}>
 {justIdentified && (
  <SurveySection
    surveys={surveys}
    userProfile={userProfile}
    justIdentified={justIdentified}
    onFillSurvey={handleFillSurvey}
    onViewAllSurveys={() => openDialog("all-surveys")}
  />
)}

    </Box>

    {/* Dialogs & Footer */}
    <LandingDialogs
      infoOpen={infoOpen}
      setInfoOpen={setInfoOpen}
      cancelDialog={cancelDialog}
      setCancelDialog={setCancelDialog}
      confirmCancelRegistration={confirmCancelRegistration}
      openMyActivities={openMyActivities}
      setOpenMyActivities={setOpenMyActivities}
        flyers={flyers}
      myActivities={myActivities}
        setUserProfile={setUserProfile} 
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
      onScrollTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onOpenInfo={() => setInfoOpen(true)}
      onOpenIdentify={() => setOpenIdentify(true)}
      onOpenAdmin={() => setOpenAdminSignIn(true)}
    />
  </Box>
);

}
