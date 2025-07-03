// src/components/SyncCalendarButton.jsx
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Button, CircularProgress } from "@mui/material";
import { saveAs } from "file-saver";
import { useState } from "react";

const pad = (n) => String(n).padStart(2, "0");
const toICSDate = (date) => {
  const d = new Date(date);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00Z"
  );
};

const buildICS = (activities) => {
  const head =
    "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Veterans Center//Activities//HE";

  const events = activities
    .map((a) => {
      const dtStart = toICSDate(a.start);
      const sEnd = a.end || new Date(new Date(a.start).getTime() + 2 * 60 * 60 * 1000);
      const dtEnd = toICSDate(sEnd);

      return [
        "BEGIN:VEVENT",
        `UID:${a.id}@veteranscenter`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${a.title}`,
        a.notes ? `DESCRIPTION:${a.notes}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [head, events, "END:VCALENDAR"].join("\n");
};

export default function SyncCalendarButton({ activities }) {
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    setBusy(true);
    try {
      const ics = buildICS(activities);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      saveAs(blob, "veterans_center_activities.ics");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={
        busy ? <CircularProgress color="inherit" size={18} /> : <CalendarMonthIcon />
      }
      disabled={busy || activities.length === 0}
      fullWidth
      sx={{ mt: 2 }}
      onClick={handleClick}
    >
      סנכרן ליומן
    </Button>
  );
}
