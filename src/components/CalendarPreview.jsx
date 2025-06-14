// src/components/CalendarPreview.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";
import useUserProfile from "../hooks/useUserProfile";

import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ActivityService from "../services/ActivityService";
import usePublicHolidays from "../hooks/usePublicHolidays";

export default function CalendarPreview({ openDialog, userProfile, setOpenIdentify }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activities, setActivities] = useState([]);
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const calendarRef = useRef(null);
  const [tagFilter, setTagFilter] = useState("ALL");

  const holidays = usePublicHolidays();

  useEffect(() => ActivityService.subscribe(setActivities), []);

  const allTags = useMemo(() => {
    const s = new Set();
    activities.forEach((a) => (a.tags || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [activities]);

  const events = useMemo(() => {
    const actEvents = activities
      .filter((a) => tagFilter === "ALL" || (a.tags || []).includes(tagFilter))
      .flatMap((a) =>
        a.recurring && (a.weekdays || []).length
          ? [{
              id: `${a.id}-rec`,
              title: a.name,
              daysOfWeek: a.weekdays,
              startTime: a.startTime,
              endTime: a.endTime,
              startRecur: a.date,
              backgroundColor: "#9575CD",
              textColor: "#ffffff",
              activityId: a.id,
            }]
          : [{
              id: a.id,
              title: a.name,
              start: `${a.date}T${a.startTime}`,
              end: `${a.date}T${a.endTime}`,
              backgroundColor: "#B39DDB",
              textColor: "#000000",
              activityId: a.id,
            }]
      );

    const holidayEvents = holidays.map((h) => ({
      id: `hol-${h.date}`,
      title: h.title || h.name,
      start: h.date,
      allDay: true,
      backgroundColor: "#B3E5FC",
      textColor: "#000000",
      holiday: true,
    }));

    return [...actEvents, ...holidayEvents];
  }, [activities, holidays, tagFilter]);

  const handleEventClick = (info) => {
    if (info.event.extendedProps.holiday) return;

    const actId = info.event.extendedProps.activityId;
    const act = activities.find((a) => a.id === actId);
    if (!act) return;

    const { capacity = 0, participants = [] } = act;
    if (capacity && participants.length >= capacity) {
      alert("מצטערים, אין מקום פנוי בפעילות זו.");
      return;
    }

    if (!userProfile || !userProfile.phone) {
      setOpenIdentify(true);
      return;
    }

    openDialog("register", actId);
  };
  return (
    <>
      {/* מבט שבועי / חודשי */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} justifyContent="center" flexWrap="wrap">
        <Button
          variant={calendarView === "timeGridWeek" ? "contained" : "outlined"}
          onClick={() => {
            setCalendarView("timeGridWeek");
            calendarRef.current?.getApi().changeView("timeGridWeek");
          }}
          sx={{
            borderColor: "#9c27b0",
            color: calendarView === "timeGridWeek" ? "#fff" : "#9c27b0",
            backgroundColor: calendarView === "timeGridWeek" ? "#9c27b0" : "transparent",
            fontWeight: "bold",
            borderWidth: 1.5,
            minWidth: isMobile ? "100px" : "auto",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }}
        >
          לוח שבועי
        </Button>

        <Button
          variant={calendarView === "dayGridMonth" ? "contained" : "outlined"}
          onClick={() => {
            setCalendarView("dayGridMonth");
            calendarRef.current?.getApi().changeView("dayGridMonth");
          }}
          sx={{
            borderColor: "#9c27b0",
            color: calendarView === "dayGridMonth" ? "#fff" : "#9c27b0",
            backgroundColor: calendarView === "dayGridMonth" ? "#9c27b0" : "transparent",
            fontWeight: "bold",
            borderWidth: 1.5,
            minWidth: isMobile ? "100px" : "auto",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }}
        >
          כל פעילויות החודש
        </Button>
      </Stack>

      {/* ניווט שבועי */}
      {calendarView === "timeGridWeek" && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="center">
          <Button
            size="small"
            variant="outlined"
            onClick={() => calendarRef.current?.getApi().prev()}
            sx={{
              borderColor: "#9c27b0",
              color: "#9c27b0",
              fontWeight: "bold",
              px: 2,
              py: 0.5,
              fontSize: "0.75rem",
              minWidth: "80px",
            }}
          >
            הקודם
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const api = calendarRef.current?.getApi();
              const next = new Date(api.getDate());
              next.setDate(next.getDate() + 7);
              const today = new Date();
              if (next.getMonth() === today.getMonth()) {
                api.next();
              }
            }}
            sx={{
              borderColor: "#9c27b0",
              color: "#9c27b0",
              fontWeight: "bold",
              px: 2,
              py: 0.5,
              fontSize: "0.75rem",
              minWidth: "80px",
            }}
          >
            הבא
          </Button>
        </Stack>
      )}

      {/* סינון לפי תגית */}
      <ToggleButtonGroup
        exclusive
        value={tagFilter}
        onChange={(_, v) => setTagFilter(v || "ALL")}
        sx={{ mb: 2, flexWrap: "wrap", justifyContent: "center" }}
      >
        <ToggleButton
          value="ALL"
          sx={{
            fontSize: "0.85rem",
            px: 2,
            py: 0.5,
            borderRadius: "8px",
            height: 36,
            color: "#6a1b9a",
            borderColor: "#9c27b0",
            '&.Mui-selected': {
              backgroundColor: "#9c27b0",
              color: "#fff",
            },
          }}
        >
          הכל
        </ToggleButton>

        {allTags.map((t) => (
          <ToggleButton
            key={t}
            value={t}
            sx={{
              fontSize: "0.85rem",
              px: 2,
              py: 0.5,
              borderRadius: "8px",
              height: 36,
              color: "#6a1b9a",
              borderColor: "#9c27b0",
              '&.Mui-selected': {
                backgroundColor: "#9c27b0",
                color: "#fff",
              },
            }}
          >
            {t}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* לוח שנה עצמו */}
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
        eventContent={(arg) => {
          const viewType = calendarRef.current?.getApi().view.type;
          const timeText = arg.timeText;
          return (
            <div className="custom-event">
              <b>{viewType === "dayGridMonth" ? `${timeText} ` : ""}{arg.event.title}</b>
            </div>
          );
        }}
      />
    </>
  );
}
