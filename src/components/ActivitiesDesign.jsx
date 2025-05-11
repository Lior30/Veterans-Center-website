// src/components/ActivitiesDesign.jsx
import React from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";

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
  // Build combined calendar events
  const events = [
    // one-offs
    ...activities
      .filter((a) => !a.recurring)
      .map((a) => ({
        id: a.id,
        title: a.name,
        start: `${a.date}T${a.startTime}`,
        end: `${a.date}T${a.endTime}`,
        backgroundColor: "#90CAF9",
      })),

    // recurring
    ...activities
      .filter((a) => a.recurring && (a.weekdays || []).length > 0)
      .map((a) => ({
        id: `${a.id}-rec`,
        title: a.name,
        daysOfWeek: a.weekdays,
        startTime: a.startTime,
        endTime: a.endTime,
        startRecur: a.date,
        backgroundColor: "#A5D6A7",
      })),

    // public holidays
    ...holidays,
  ];

  const columns = [
    { field: "date", headerName: "תאריך", width: 110, headerAlign: "right", align: "right" },
    { field: "startTime", headerName: "התחלה", width: 110, headerAlign: "right", align: "right" },
    { field: "endTime", headerName: "סיום", width: 110, headerAlign: "right", align: "right" },
    { field: "name", headerName: "שם", flex: 1, headerAlign: "right", align: "right" },
    { field: "description", headerName: "תיאור", flex: 1, headerAlign: "right", align: "right" },
    { field: "capacity", headerName: "קיבולת", width: 90, headerAlign: "right", align: "right" },
    { field: "registeredCount", headerName: "נרשמו", width: 90, headerAlign: "right", align: "right" },
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
      width: 160,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <>
          <Button
            size="small"
            onClick={() => onEdit(params.row)}
            sx={{ mr: 1 }}
          >
            ערוך
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(params.row)}
          >
            מחק
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container dir="rtl">
      {/* Header with title + home button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          mb: 2,
        }}
      >
        <Typography variant="h4">פעילויות</Typography>
        <Button variant="outlined" onClick={() => (window.location.href = "/")}>
          בית
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => onTabChange(v)}>
          <Tab label="רשימה" />
          <Tab label="לוח שנה" />
        </Tabs>
      </Box>

      {/* List view */}
      {tab === 0 && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onNew} sx={{ mb: 2 }}>
            הוספת פעילות
          </Button>
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={activities}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10]}
              getRowId={(r) => r.id}
            />
          </Box>
        </Box>
      )}

      {/* Calendar view */}
      {tab === 1 && (
        <Box sx={{ mt: 2 }}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={onClose}>
        <DialogTitle>
          {form.id ? "עריכת פעילות" : "הוספת פעילות חדשה"}
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1, minWidth: 400 }}>
          <TextField
            label="שם הפעילות"
            value={form.name}
            onChange={(e) => onFormChange((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="תיאור"
            value={form.description}
            onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))}
          />
          <TextField
            label="תאריך"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={(e) => onFormChange((f) => ({ ...f, date: e.target.value }))}
          />
          <TextField
            label="שעת התחלה"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.startTime}
            onChange={(e) => onFormChange((f) => ({ ...f, startTime: e.target.value }))}
          />
          <TextField
            label="שעת סיום"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.endTime}
            onChange={(e) => onFormChange((f) => ({ ...f, endTime: e.target.value }))}
          />
          <TextField
            label="קיבולת"
            type="number"
            InputLabelProps={{ shrink: true }}
            value={form.capacity}
            onChange={(e) => onFormChange((f) => ({ ...f, capacity: e.target.value }))}
          />
          <TextField
            label="Flyer ID (אופציונלי)"
            value={form.flyerId}
            onChange={(e) => onFormChange((f) => ({ ...f, flyerId: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.recurring}
                onChange={(e) =>
                  onFormChange((f) => ({
                    ...f,
                    recurring: e.target.checked,
                    weekdays: e.target.checked ? [] : [],
                  }))
                }
              />
            }
            label="פעילות חוזרת?"
          />
          {form.recurring && (
            <Box>
              <Typography>בחר ימי שבוע חוזרים:</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {WEEKDAYS.map((d) => (
                  <FormControlLabel
                    key={d.value}
                    label={d.label}
                    control={
                      <Checkbox
                        checked={(form.weekdays || []).includes(d.value)}
                        onChange={(e) => {
                          const curr = form.weekdays || [];
                          const next = e.target.checked
                            ? [...curr, d.value]
                            : curr.filter((wd) => wd !== d.value);
                          onFormChange((f) => ({ ...f, weekdays: next }));
                        }}
                      />
                    }
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>בטל</Button>
          {form.id && (
            <Button
              color="error"
              onClick={() => {
                onDelete(form);
                onClose();
              }}
            >
              מחק
            </Button>
          )}
          <Button variant="contained" onClick={onSave}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
