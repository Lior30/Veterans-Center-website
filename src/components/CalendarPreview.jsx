// src/components/CalendarPreview.jsx
import React, { useEffect, useMemo, useState } from "react";
import FullCalendar                      from "@fullcalendar/react";
import dayGridPlugin                     from "@fullcalendar/daygrid";
import interactionPlugin                 from "@fullcalendar/interaction";
import heLocale                          from "@fullcalendar/core/locales/he";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
}                                        from "@mui/material";

import ActivityService                   from "../services/ActivityService";
import UserService                       from "../services/UserService";
import usePublicHolidays                 from "../hooks/usePublicHolidays";

export default function CalendarPreview() {
  /* live activities */
  const [activities, setActivities] = useState([]);
  useEffect(() => ActivityService.subscribe(setActivities), []);

  /* 🇮🇱 public holidays */
  const holidays = usePublicHolidays();

  /* tag filter */
  const [tagFilter, setTagFilter] = useState("ALL");
  const allTags = useMemo(() => {
    const s = new Set();
    activities.forEach((a) => (a.tags || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [activities]);

  /* events (respect tagFilter) */
  const events = useMemo(() => {
    const actEvents = activities
      .filter(
        (a) => tagFilter === "ALL" || (a.tags || []).includes(tagFilter)
      )
      .flatMap((a) =>
        a.recurring && (a.weekdays || []).length
          ? [
              {
                id: `${a.id}-rec`,
                title: a.name,
                daysOfWeek: a.weekdays,
                startTime:  a.startTime,
                endTime:    a.endTime,
                startRecur: a.date,
                backgroundColor:"#A5D6A7",
                activityId:a.id,
              },
            ]
          : [
              {
                id: a.id,
                title: a.name,
                start: `${a.date}T${a.startTime}`,
                end:   `${a.date}T${a.endTime}`,
                backgroundColor:"#90CAF9",
                activityId:a.id,
              },
            ]
      );

    const holidayEvents = holidays.map((h) => ({
      id:`hol-${h.date}`, title:h.title || h.name, start:h.date, allDay:true,
      backgroundColor:"#FFE082", holiday:true,
    }));

    return [...actEvents, ...holidayEvents];
  }, [activities, holidays, tagFilter]);

  /* registration dialog */
  const [selId, setSelId] = useState(null);
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [err,   setErr]   = useState("");

  const validName  = /^[A-Za-z\u0590-\u05FF\s]+$/.test(name.trim());
   const validPhone = UserService.isValidPhone(phone.trim());

  const handleEventClick = (info) => {
    if (info.event.extendedProps.holiday) return;
    const actId = info.event.extendedProps.activityId;
    const act   = activities.find((a) => a.id === actId);
    if (!act) return;

    const { capacity = 0, registrants = [] } = act;
    if (capacity && registrants.length >= capacity) {
      alert("מצטערים, אין מקום פנוי בפעילות זו.");
      return;
    }
    setSelId(act.id);
    setName("");
    setPhone("");
    setErr("");
  };

  const register = async () => {
    if (!validName || !validPhone) {
      setErr("שם חייב להכיל אותיות בלבד, וטלפון – ספרות בלבד.");
      return;
    }
    try {
      const user = await UserService.findOrCreate({
        name:  name.trim(),
        phone: phone.trim(),
      });
      await ActivityService.registerUser(selId, user.id);
      setSelId(null);
      alert("ההרשמה בוצעה בהצלחה!");
    } catch (e) {
      if (e.message === "FULL") alert("מצטערים, אין מקום פנוי.");
      else {
        console.error(e);
        alert("אירעה שגיאה, נסו שוב.");
      }
    }
  };

  return (
    <>
      {/* tag filter bar */}
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
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={heLocale}
        height="auto"
        events={events}
        headerToolbar={false}
        selectable={false}
        editable={false}
        eventClick={handleEventClick}
      />

      {/* registration dialog */}
      <Dialog
        open={Boolean(selId)}
        onClose={() => setSelId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>הרשמה לפעילות</DialogTitle>
        <DialogContent>
          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              error={name && !validName}
              helperText={name && !validName ? "אותיות ורווחים בלבד" : " "}
            />
            <TextField
              label="מספר טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              error={phone && !validPhone}
              helperText={phone && !validPhone ? "טלפון לא תקין (05X1234567)" : " "}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelId(null)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={register}
            disabled={!validName || !validPhone}
          >
            הרשמה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
