// src/components/CalendarPreview.jsx
import React, { useMemo, useState, useRef } from "react";
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
  Tabs,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowBackIosIcon    from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ViewWeekIcon        from "@mui/icons-material/ViewWeek";
import CalendarMonthIcon   from "@mui/icons-material/CalendarMonth";
import EventIcon           from "@mui/icons-material/Event";

import SectionTitle      from "./SectionTitle";
import usePublicHolidays from "../hooks/usePublicHolidays";

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
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down("sm"));
  const calendarRef = useRef(null);

  const [view, setView]       = useState("timeGridWeek");
  const [tag,  setTag]        = useState("ALL");
  const holidays              = usePublicHolidays();

  // build tag list
  const tags = useMemo(() => {
    const s = new Set();
    activities.forEach(a => (a.tags || []).forEach(t => s.add(t)));
    return ["ALL", ...Array.from(s)];
  }, [activities]);

  // build events: activities + holidays
  const events = useMemo(() => {
    const actEv = activities
      .filter(a => tag === "ALL" || (a.tags || []).includes(tag))
      .map(a => ({
        id:    a.id,
        title: a.name,
        start: a.recurring ? undefined : `${a.date}T${a.startTime}`,
        end:   a.recurring ? undefined : `${a.date}T${a.endTime}`,
        daysOfWeek:  a.recurring ? a.weekdays   : undefined,
        startTime:   a.recurring ? a.startTime  : undefined,
        endTime:     a.recurring ? a.endTime    : undefined,
        startRecur:  a.recurring ? a.date       : undefined,
        backgroundColor: theme.palette.primary.lightblue,
        textColor: "#000",
        extendedProps: { activityId: a.id, isHoliday: false },
      }));

    const holEv = holidays.map(h => ({
      id:  `hol-${h.date}`,
      title: h.title || h.name,
      start: h.date,
      allDay: true,
      backgroundColor: "#FFFACD",
      textColor: "#000",
      extendedProps: { holiday: true, isHoliday: true },
    }));

    return [...actEv, ...holEv];
  }, [activities, holidays, tag, theme.palette]);

  // click handler
  const handleEventClick = info => {
    const props = info.event.extendedProps;
    if (props.isHoliday) return;

    if (!userProfile?.phone) {
      setOpenIdentify(true);
      return;
    }

    const activityId = props.activityId;
    const flyer    = flyers.find(f => f.activityId === activityId);
    const activity = activities.find(a => a.id === activityId);

    if (flyer)       openDialog("flyer", flyer);
    else if (activity) openDialog("activity-details", activity);
    else alert("לא נמצאה פעילות תואמת");
  };

  const goPrev = () => calendarRef.current.getApi().prev();
  const goNext = () => calendarRef.current.getApi().next();

  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, backgroundColor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="לוח פעילויות" />

        {/* TOGGLE */}
        <Stack direction="row" spacing={6} justifyContent="center" sx={{ mb: 4 }}>
          <ToggleButton
            title="תצוגה שבועית"
            active={view === "timeGridWeek"}
            icon={<ViewWeekIcon fontSize="large" />}
            label="שבועי"
            onClick={() => {
              setView("timeGridWeek");
              calendarRef.current.getApi().changeView("timeGridWeek");
            }}
          />

          <ToggleButton
            title="תצוגה חודשית"
            active={view === "dayGridMonth"}
            icon={<CalendarMonthIcon fontSize="large" />}
            label="חודשי"
            onClick={() => {
              setView("dayGridMonth");
              calendarRef.current.getApi().changeView("dayGridMonth");
            }}
          />
        </Stack>

        {/* NAV ARROWS */}
        <NavWrapper>
          <NavArrow side="left"  onClick={goNext} />
          <NavArrow side="right" onClick={goPrev} />
        </NavWrapper>

        {/* TAG FILTER */}
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}>
          <Tabs
            value={tag}
            onChange={(e, newTag) => setTag(newTag)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {tags.map(t => (
              <Tab
                key={t}
                value={t}
                label={t === "ALL" ? "הכל" : t}
                sx={{
                  fontWeight: tag === t ? 600 : 400,
                  color: tag === t ? theme.palette.primary.main : theme.palette.text.primary,
                  minWidth: 90,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* CALENDAR */}
        <Box sx={{ overflowX: isMobile ? "auto" : "visible" }}>
          <Box sx={{
            minWidth: isMobile ? 650 : "auto",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fafafa",

            /* HEADER */
            "& .fc-col-header-cell": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              fontSize: isMobile ? "0.75em" : "1rem",
            },

            /* TODAY */
            "& .fc-timegrid-col.fc-day-today, & .fc-daygrid-day.fc-day-today": {
              backgroundColor: `${theme.palette.primary.vlight} !important`,
            },

            /* EVENT – WEEK/DAY (timeGrid) */
            "& .fc-timegrid-event-harness": {
              backgroundColor: "transparent !important",
              border:       "none !important",
              borderRadius: 0,
              margin: "3px 0",    
              height: "auto !important"           // ריווח בין אירועים
            },

           "& .fc-timegrid-event": {
  position: "relative !important",  // ⟵ העיקר!
  zIndex: 5,                        // מעל קווי הטבלה
  height: "auto !important",
  border: "none !important",
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.lightblue,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  padding: isMobile ? "1px 4px" : "4px 8px",
  boxSizing: "border-box",
  overflow: "visible !important",
  whiteSpace: "normal !important",
  wordBreak: "break-word !important",
},

            "& .fc-timegrid-event .fc-event-main": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },

            /* EVENT – MONTH (dayGrid) */
            "& .fc-daygrid-event": {
              border: "none !important",
              borderRadius: "8px",
              backgroundColor: theme.palette.primary.lightblue,
              color: "#000",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              overflow: "visible !important",
              whiteSpace: "normal !important",
              wordBreak: "break-word !important",
              margin: "2px 0",
              padding: isMobile ? "1px" : "4px",
              fontSize: isMobile ? "0.7em" : "0.85em",
            },
            "& .fc-daygrid-event-dot": { display: "none" },
            "& .fc-daygrid-event .fc-event-main-frame": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
          }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              locale={heLocale}
              height="auto"
              nowIndicator
              allDaySlot={false}
              events={events}
              headerToolbar={false}
              selectable={false}
              editable={false}
              slotEventOverlap={false}
              eventOverlap={false}
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
              slotDuration="01:00:00"
              slotLabelInterval="01:00"
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
displayEventEnd={false}          // (תכונה מובנית ב-FullCalendar ≥ v6)

              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}

              eventClick={handleEventClick}

              eventDidMount={(info) => {
                const title = info.el.querySelector(".fc-event-title");
                const frame = info.el.querySelector(".fc-event-main");
                if (!title || !frame) return;

                // כווץ פונט עד שהכותרת נכנסת
                let fs = parseFloat(getComputedStyle(title).fontSize);
                const fits = () =>
                  title.scrollHeight <= frame.clientHeight &&
                  title.scrollWidth  <= frame.clientWidth;

                while (!fits() && fs > 8) {
                  fs -= 1;
                  title.style.fontSize = `${fs}px`;
                }
              }}

             eventContent={(renderInfo) => {
const startOnly = renderInfo.timeText;   // כבר נקי
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          whiteSpace: "normal",
          textAlign: "center",
          lineHeight: 1.2,
          fontSize: isMobile ? "0.7em" : "0.85em",
        }}
      >
        {renderInfo.event.title}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: isMobile ? "0.6em" : "0.75em" }}>
        {startOnly}
      </Typography>
    </Box>
  );
}}

            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

/* -------------------------------------------------- */
/* עזרונים קטנים לשמירה על קוד נקי                   */
/* -------------------------------------------------- */

function ToggleButton({ title, icon, label, active, onClick }) {
  const theme = useTheme();
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onClick}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: active ? theme.palette.primary.light : theme.palette.text.secondary,
        }}
      >
        {icon}
        <Typography
          variant="subtitle1"
          fontWeight={active ? 700 : 400}
          sx={{ mt: 0.5 }}
        >
          {label}
        </Typography>
      </IconButton>
    </Tooltip>
  );
}

function NavArrow({ side, onClick }) {
  const theme = useTheme();
  const isLeft = side === "left";
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: 0,
        [isLeft ? "left" : "right"]: 0,
        transform: `translate(${isLeft ? "-" : ""}50%, -50%)`,
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        "&:hover": { backgroundColor: theme.palette.primary.dark },
        [theme.breakpoints.down("sm")]: {
          top: "50%",
          transform: `translate(${isLeft ? "-" : ""}50%, -50%)`,
        },
      }}
    >
      {isLeft ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
    </IconButton>
  );
}
