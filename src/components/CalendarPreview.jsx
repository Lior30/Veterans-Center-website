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
} from "@mui/material";

import ActivityService from "../services/ActivityService";
import usePublicHolidays from "../hooks/usePublicHolidays";

export default function CalendarPreview({ openDialog, userProfile, setOpenIdentify }) {

  const [activities, setActivities] = useState([]);

  useEffect(() => ActivityService.subscribe(setActivities), []);

  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const calendarRef = useRef(null);

  const holidays = usePublicHolidays();

  const [tagFilter, setTagFilter] = useState("ALL");
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
          ? [
              {
                id: `${a.id}-rec`,
                title: a.name,
                daysOfWeek: a.weekdays,
                startTime: a.startTime,
                endTime: a.endTime,
                startRecur: a.date,
                backgroundColor: "#A5D6A7",
                activityId: a.id,
              },
            ]
          : [
              {
                id: a.id,
                title: a.name,
                start: `${a.date}T${a.startTime}`,
                end: `${a.date}T${a.endTime}`,
                backgroundColor: "#90CAF9",
                activityId: a.id,
              },
            ]
      );

    const holidayEvents = holidays.map((h) => ({
      id: `hol-${h.date}`,
      title: h.title || h.name,
      start: h.date,
      allDay: true,
      backgroundColor: "#FFE082",
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
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant={calendarView === "timeGridWeek" ? "contained" : "outlined"}
          onClick={() => {
            setCalendarView("timeGridWeek");
            calendarRef.current?.getApi().changeView("timeGridWeek");
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
        >
          כל פעילויות החודש
        </Button>
      </Stack>

      <ToggleButtonGroup
        exclusive
        value={tagFilter}
        onChange={(_, v) => setTagFilter(v || "ALL")}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="ALL">הכל</ToggleButton>
        {allTags.map((t) => (
          <ToggleButton key={t} value={t}>
            {t}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

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
