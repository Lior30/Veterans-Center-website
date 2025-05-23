// src/components/ActivitiesDesign.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";

import ActivityService from "../services/ActivityService";
import UserService from "../services/UserService";

const WEEKDAYS = [
  { label: "א׳", value: 1 },
  { label: "ב׳", value: 2 },
  { label: "ג׳", value: 3 },
  { label: "ד׳", value: 4 },
  { label: "ה׳", value: 5 },
  { label: "ו׳", value: 6 },
  { label: "ש׳", value: 0 },
];

export default function ActivitiesDesign({
  tab,
  activities,
  holidays,
  dialogOpen,
  form,
  onTabChange,
  onNew,
  onEdit,
  onDelete,
  onDateClick,
  onEventClick,
  onFormChange,
  onSave,
  onClose,
}) {
  const [tagFilter, setTagFilter] = useState("ALL");
  const allTags = useMemo(() => {
    const set = new Set();
    activities.forEach((a) => (a.tags || []).forEach((t) => set.add(t)));
    return [...set];
  }, [activities]);

  const [selAct, setSelAct] = useState(null);
  const [users, setUsers] = useState({});
  useEffect(() => {
    if (!selAct) return;
    (async () => {
      const map = {};
      for (const uid of selAct.registrants || []) {
        const u = await UserService.get(uid);
        map[uid] = u?.name || uid;
      }
      setUsers(map);
    })();
  }, [selAct]);

  const kickUser = async (uid) => {
    await ActivityService.removeUser(selAct.id, uid);
    setSelAct((prev) =>
      prev
        ? { ...prev, registrants: prev.registrants.filter((x) => x !== uid) }
        : prev
    );
  };

  const events = useMemo(() => {
    const filteredActs = activities.filter(
      (a) => tagFilter === "ALL" || (a.tags || []).includes(tagFilter)
    );

    const actEvents = filteredActs.flatMap((a) =>
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
            },
          ]
        : [
            {
              id: a.id,
              title: a.name,
              start: `${a.date}T${a.startTime}`,
              end: `${a.date}T${a.endTime}`,
              backgroundColor: "#90CAF9",
            },
          ]
    );

    const holidayEvents = holidays;

    return [...actEvents, ...holidayEvents];
  }, [activities, holidays, tagFilter]);

  const columns = [
    { field: "date", headerName: "תאריך", width: 110, headerAlign: "right", align: "right" },
    { field: "startTime", headerName: "התחלה", width: 110, headerAlign: "right", align: "right" },
    { field: "endTime", headerName: "סיום", width: 110, headerAlign: "right", align: "right" },
    { field: "name", headerName: "שם", flex: 1, headerAlign: "right", align: "right" },
    { field: "description", headerName: "תיאור", flex: 1, headerAlign: "right", align: "right" },
    {
      field: "tags",
      headerName: "תגיות",
      width: 120,
      headerAlign: "right",
      align: "right",
      valueGetter: (params) => {
        const t = Array.isArray(params?.row?.tags) ? params.row.tags : [];
        return t.join(", ");
      },
    },
    {
      field: "capacity",
      headerName: "קיבולת",
      width: 90,
      headerAlign: "right",
      align: "right",
      renderCell: ({ row }) =>
        row.capacity ? `${row.registeredCount}/${row.capacity}` : "∞",
    },
    {
      field: "recurring",
      headerName: "חוזרת?",
      width: 100,
      headerAlign: "right",
      align: "right",
      valueFormatter: ({ value }) => (value ? "כן" : "לא"),
    },
    {
      field: "actions",
      headerName: "פעולות",
      width: 260,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => onEdit(params.row)} sx={{ mr: 1 }}>
            ערוך
          </Button>
          <Button size="small" color="error" onClick={() => onDelete(params.row)} sx={{ mr: 1 }}>
            מחק
          </Button>
          <Button size="small" variant="outlined" onClick={() => setSelAct(params.row)} sx={{ whiteSpace: "nowrap" }}>
            נרשמים
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container dir="rtl">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 2 }}>
        <Typography variant="h4">פעילויות</Typography>
        <Button variant="outlined" onClick={() => (window.location.href = "/")}>
          בית
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => onTabChange(v)}>
          <Tab label="רשימה" />
          <Tab label="לוח שנה" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onNew} sx={{ mb: 2 }}>
            הוספת פעילות
          </Button>
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={activities.filter((r) => r.id)}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10]}
              getRowId={(r) => r.id ?? r.tempId}
            />
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ mt: 2 }}>
          <ToggleButtonGroup exclusive value={tagFilter} onChange={(_, v) => setTagFilter(v || "ALL")} sx={{ mb: 2 }}>
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
            direction="rtl"
            events={events}
            dateClick={(info) => onDateClick(info.dateStr)}
            eventClick={(info) => onEventClick(info)}
            headerToolbar={{ left: "today prev,next", center: "title", right: "" }}
            height={600}
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={onClose}>
        <DialogTitle>{form.id ? "עריכת פעילות" : "הוספת פעילות חדשה"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1, minWidth: 400 }}>
          <TextField placeholder="שם הפעילות" value={form.name} onChange={(e) => onFormChange((f) => ({ ...f, name: e.target.value }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />
          <TextField placeholder="תיאור" value={form.description} onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />
          <TextField placeholder="תגיות (מופרדות בפסיקים)" value={(form.tags || []).join(", ")} onChange={(e) => onFormChange((f) => ({ ...f, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />
          <TextField placeholder="תאריך" type="date" value={form.date} onChange={(e) => onFormChange((f) => ({ ...f, date: e.target.value }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />
          <TextField placeholder="שעת התחלה" type="time" value={form.startTime} onChange={(e) => onFormChange((f) => ({ ...f, startTime: e.target.value }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />
          <TextField placeholder="שעת סיום" type="time" value={form.endTime} onChange={(e) => onFormChange((f) => ({ ...f, endTime: e.target.value }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />
          <TextField placeholder="קיבולת" type="number" value={form.capacity} onChange={(e) => onFormChange((f) => ({ ...f, capacity: e.target.value }))} fullWidth inputProps={{ dir: "rtl", style: { textAlign: 'right' } }} />

          <FormControlLabel control={<Checkbox checked={form.recurring} onChange={(e) => onFormChange((f) => ({ ...f, recurring: e.target.checked, weekdays: e.target.checked ? [] : [] }))} />} label="פעילות חוזרת?" />
          {form.recurring && (
            <Box>
              <Typography sx={{ mb: 1 }}>בחר ימי שבוע חוזרים:</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {WEEKDAYS.map((d) => (
                  <FormControlLabel key={d.value} label={d.label} control={<Checkbox checked={(form.weekdays || []).includes(d.value)} onChange={(e) => {
                    const curr = form.weekdays || [];
                    const next = e.target.checked ? [...curr, d.value] : curr.filter((wd) => wd !== d.value);
                    onFormChange((f) => ({ ...f, weekdays: next }));
                  }} />} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>בטל</Button>
          {form.id && <Button color="error" onClick={() => { onDelete(form); onClose(); }}>מחק</Button>}
          <Button variant="contained" onClick={onSave}>שמור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selAct)} onClose={() => setSelAct(null)} fullWidth maxWidth="sm">
        <DialogTitle>נרשמים – {selAct?.name}</DialogTitle>
        <DialogContent dividers>
          {(selAct?.registrants || []).length === 0 && "אין נרשמים כרגע."}
          {(selAct?.registrants || []).map((uid) => (
            <Stack key={uid} direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <span>{users[uid] || uid}</span>
              <IconButton onClick={() => kickUser(uid)}><DeleteIcon /></IconButton>
            </Stack>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelAct(null)}>סגור</Button></DialogActions>
      </Dialog>
    </Container>
  );
}
