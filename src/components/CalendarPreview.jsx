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
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
  styled,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import SectionTitle from "./SectionTitle";
import ActivityService from "../services/ActivityService";
import usePublicHolidays from "../hooks/usePublicHolidays";

const NavToggle = styled(ToggleButton)(({ theme }) => ({
  textTransform: "none",
  borderRadius: theme.shape.borderRadius * 2,
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
  fontWeight: 500,
  minWidth: 100,
  [theme.breakpoints.down("sm")]: {
    minWidth: 80,
    fontSize: "0.75rem",
    padding: theme.spacing(0.5, 1),
  },
}));

export default function CalendarPreview({
  openDialog,
  userProfile,
  setOpenIdentify,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activities, setActivities] = useState([]);
  const [view, setView] = useState("timeGridWeek");
  const calendarRef = useRef(null);
  const [tag, setTag] = useState("ALL");
  const holidays = usePublicHolidays();

  useEffect(() => ActivityService.subscribe(setActivities), []);

  const tags = useMemo(() => {
    const s = new Set();
    activities.forEach(a => (a.tags || []).forEach(t => s.add(t)));
    return ["ALL", ...Array.from(s)];
  }, [activities]);

  const events = useMemo(() => {
    const actEv = activities
      .filter(a => tag === "ALL" || (a.tags || []).includes(tag))
      .map(a => ({
        id: a.id,
        title: a.name,
        start: a.recurring
          ? undefined
          : `${a.date}T${a.startTime}`,
        end: a.recurring
          ? undefined
          : `${a.date}T${a.endTime}`,
        daysOfWeek: a.recurring ? a.weekdays : undefined,
        startTime: a.recurring ? a.startTime : undefined,
        endTime: a.recurring ? a.endTime : undefined,
        startRecur: a.recurring ? a.date : undefined,
        backgroundColor: theme.palette.secondary.light,
        textColor: "#000",
        extendedProps: { activityId: a.id },
      }));
    const holEv = holidays.map(h => ({
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

  const handleEventClick = info => {
    const props = info.event.extendedProps;
    if (props.holiday) return;
    if (!userProfile?.phone) {
      setOpenIdentify(true);
      return;
    }
    openDialog("register", props.activityId);
  };

  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, backgroundColor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="לוח פעילויות" />

        {/* View Switch */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 3, flexWrap: "wrap" }}
        >
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => {
              if (v) {
                setView(v);
                calendarRef.current.getApi().changeView(v);
              }
            }}
          >
            <NavToggle value="timeGridWeek">שבועי</NavToggle>
            <NavToggle value="dayGridMonth">חודשי</NavToggle>
          </ToggleButtonGroup>
        </Stack>

        {/* Tag Filter */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 4, flexWrap: "wrap" }}
        >
          {tags.map(t => (
            <NavToggle
              key={t}
              value={t}
              selected={tag === t}
              onClick={() => setTag(t)}
            >
              {t === "ALL" ? "הכל" : t}
            </NavToggle>
          ))}
        </Stack>

        {/* Calendar */}
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: theme.shadows[1],
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
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          />
        </Box>
      </Container>
    </Box>
  );
}
