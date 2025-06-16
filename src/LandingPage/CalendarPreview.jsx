// src/components/CalendarPreview.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";
import {
  Box,
  Container,
  Stack,
  useMediaQuery,
  useTheme,
  styled,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EventIcon from "@mui/icons-material/Event";
import SectionTitle from "./SectionTitle";
import ActivityService from "../services/ActivityService";
import usePublicHolidays from "../hooks/usePublicHolidays";
import CtaButton from "./CtaButton";

const NavWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
}));

export default function CalendarPreview({
  openDialog,
  userProfile,
  setOpenIdentify,
  activities,
  flyers,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [view, setView] = useState("timeGridWeek");
  const calendarRef = useRef(null);
  const [tag, setTag] = useState("ALL");
  const holidays = usePublicHolidays();

  const tags = useMemo(() => {
    const s = new Set();
    activities.forEach((a) => (a.tags || []).forEach((t) => s.add(t)));
    return ["ALL", ...Array.from(s)];
  }, [activities]);

  const events = useMemo(() => {
    const actEv = activities
      .filter((a) => tag === "ALL" || (a.tags || []).includes(tag))
      .map((a) => ({
        id: a.id,
        title: a.name,
        start: a.recurring ? undefined : `${a.date}T${a.startTime}`,
        end: a.recurring ? undefined : `${a.date}T${a.endTime}`,
        daysOfWeek: a.recurring ? a.weekdays : undefined,
        startTime: a.recurring ? a.startTime : undefined,
        endTime: a.recurring ? a.endTime : undefined,
        startRecur: a.recurring ? a.date : undefined,
        backgroundColor: theme.palette.secondary.light,
        textColor: "#000",
        extendedProps: { activityId: a.id },
      }));
    const holEv = holidays.map((h) => ({
      id: `hol-${h.date}`,
      title: h.title || h.name,
      start: h.date,
      allDay: true,
      backgroundColor: theme.palette.info.light,
      textColor: "#000",
      extendedProps: { holiday: true },
    }));
    return [...actEv, ...holEv];
  }, [activities, holidays, tag, theme.palette]);

  const handleEventClick = (info) => {
    const props = info.event.extendedProps;
    if (props.holiday) return;
    if (!userProfile?.phone) {
      setOpenIdentify(true);
      return;
    }
    const activityId = props.activityId;
    const flyer = flyers.find((f) => f.activityId === activityId);
    const activity = activities.find((a) => a.id === activityId);
    if (flyer) {
      openDialog("flyer", flyer);
    } else if (activity) {
      openDialog("activity-details", activity);
    } else {
      alert("לא נמצאה פעילות תואמת");
    }
  };

  const goPrev = () => calendarRef.current.getApi().prev();
  const goNext = () => calendarRef.current.getApi().next();

  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, backgroundColor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="לוח פעילויות" />

        {/* שבועי / חודשי */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <CtaButton
            color={view === "timeGridWeek" ? "primary" : "default"}
            onClick={() => {
              setView("timeGridWeek");
              calendarRef.current.getApi().changeView("timeGridWeek");
            }}
          >
            שבועי
          </CtaButton>
          <CtaButton
            color={view === "dayGridMonth" ? "primary" : "default"}
            onClick={() => {
              setView("dayGridMonth");
              calendarRef.current.getApi().changeView("dayGridMonth");
            }}
          >
            חודשי
          </CtaButton>
        </Stack>

        {/* חיצים קודמים/הבא */}
        <NavWrapper>
          <IconButton
            onClick={goPrev}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(-50%, -50%)",
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={goNext}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </NavWrapper>

        {/* סינון תגיות */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 3, flexWrap: "wrap" }}
        >
          {tags.map((t, i) => {
            const colors = ["primary", "secondary", "success", "warning", "error"];
            const clr = colors[i % colors.length];
            return (
              <CtaButton
                key={t}
                color={tag === t ? clr : "default"}
                size="small"
                onClick={() => setTag(t)}
              >
                {t === "ALL" ? "הכל" : t}
              </CtaButton>
            );
          })}
        </Stack>

        {/* הפידג'ט של לוח */}
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: theme.shadows[1],
            // הסתרת השעה והגדרת סגנון לכותרת האירוע
            "& .fc-event-time": {
              display: "none",
            },
            "& .fc-event-title": {
              fontWeight: 500,
              fontSize: isMobile ? "0.8em" : "0.9em",
              padding: "2px",
              whiteSpace: "normal",
            },
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={heLocale}
            height="auto"
            events={events}
            headerToolbar={false}
            selectable={false}
            editable={false}
            eventClick={handleEventClick}
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00"
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
