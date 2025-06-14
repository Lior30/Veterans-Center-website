// src/components/ActivitiesDesign.jsx
import { Autocomplete } from "@mui/material";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";

import ActivityService from "../services/ActivityService";
import UserService from "../services/UserService";
import { db } from "../firebase";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";


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

  const [allTags, setAllTags] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customTags") || "[]");
    const s = new Set(stored);
    activities.forEach((a) => (a.tags || []).forEach((t) => s.add(t)));
    setAllTags([...s]);
  }, [activities]);

  useEffect(() => {
    const defaultSet = new Set();
    activities.forEach((a) => (a.tags || []).forEach((t) => defaultSet.add(t)));
    const custom = allTags.filter((t) => !defaultSet.has(t));
    localStorage.setItem("customTags", JSON.stringify(custom));
  }, [allTags, activities]);

  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  const [removeTagDialogOpen, setRemoveTagDialogOpen] = useState(false);

  // פונקציה לטיפול בהוספת תגית חדשה
  const handleAddTag = () => {
    const tag = newTagValue.trim();
    if (tag && !allTags.includes(tag)) {
      setAllTags((prev) => [...prev, tag]);
    }
    setNewTagValue("");
    setNewTagDialogOpen(false);
  };

  // פונקציה להסרת תגית
  const handleRemoveTag = (tagToRemove) => {
    // (א) הסר מ־allTags
    setAllTags((prev) => prev.filter((t) => t !== tagToRemove));

    // (ב) הסר את התגית הזו מכל הפעילויות ששייכות אליה
    activities.forEach((act) => {
      if (Array.isArray(act.tags) && act.tags.includes(tagToRemove)) {
        const newTags = act.tags.filter((tg) => tg !== tagToRemove);
        ActivityService.save({ ...act, tags: newTags });
      }
    });
  };

  const [selAct, setSelAct] = useState(null);
  const [users, setUsers] = useState({});
  const [registrantsFilter, setRegistrantsFilter] = useState("");
  // סינון המשתתפים לפי שדה החיפוש
const filteredParticipants = (selAct?.participants || []).filter((p) => {
  const label = (users[p.phone] || p.phone).toLowerCase();
  return label.includes(registrantsFilter.trim().toLowerCase());
});



  useEffect(() => {
    if (!selAct) return;

    const map = {};
    // selAct.participants is now [{ name, phone }, …]
   // פשוט תשתמשי בפרופרטי name ולא fullname
   (selAct.participants || []).forEach(({ name, phone }) => {
     map[phone] = `${name} — ${phone}`;
   });

    setUsers(map);
  }, [selAct]);

const kickParticipant = async (phone) => {
  // מוצא את האובייקט המלא לפי טלפון
  const participant = selAct.participants.find((p) => p.phone === phone);
  if (!participant) return;

  // עדכון ב־Firestore: הסרת המשתמש ממערך participants
  const actRef = doc(db, "activities", selAct.id);
  await updateDoc(actRef, {
    participants: arrayRemove(participant)
  });

  // עדכון מצב מקומי כדי לרענן את התצוגה
  setSelAct((prev) =>
    prev
      ? {
          ...prev,
          participants: prev.participants.filter((p) => p.phone !== phone)
        }
      : null
  );
};

const togglePaid = async (phone) => {
  const participant = selAct.participants.find((p) => p.phone === phone);
  if (!participant) return;
  const updated = { ...participant, paid: !participant.paid };
  const actRef = doc(db, "activities", selAct.id);
  // הסרה של האובייקט הישן
  await updateDoc(actRef, { participants: arrayRemove(participant) });
  // הוספה של האובייקט המעודכן עם paid משודרג
  await updateDoc(actRef, { participants: arrayUnion(updated) });
  // עדכון מצב מקומי
  setSelAct((prev) =>
    prev
      ? {
          ...prev,
          participants: prev.participants.map((p) =>
            p.phone === phone ? updated : p
          ),
        }
      : null
  );
};


  // מסנכרן פעילויות לפי תגית, ולפי מחרוזת החיפוש בשדה שם
  const filteredList = useMemo(() => {
    return activities
      .filter((a) => a.id)
      .filter(
        (a) =>
          (tagFilter === "ALL" || (a.tags || []).includes(tagFilter)) &&
          a.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
  }, [activities, tagFilter, searchQuery]);

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

    return [...actEvents, ...holidays];
  }, [activities, holidays, tagFilter]);

  const columns = [
    {
      field: "date",
      headerName: "תאריך",
      width: 120,
      headerAlign: "center",
      align: "right",
    },
    
    {
      field: "startTime",
      headerName: "התחלה",
      width: 80,
      headerAlign: "center",
      align: "right",
    },
    {
      field: "endTime",
      headerName: "סיום",
      width: 80,
      headerAlign: "center",
      align: "right",
    },
    {
      field: "name",
      headerName: "שם",
      flex: 1.5,
      minWidth: 100,
      headerAlign: "center",
      align: "right",
    },
{
  field: "description",
  headerName: "תיאור",
  flex: 1,
  minWidth: 200,
  headerAlign: "center",
  align: "right",
  // <-- הוספה של class ייחודי
  cellClassName: "multi-line-cell",
},

  
  {
    field: "registrationCondition",
    headerName: "תנאי הרשמה",
    width: 120,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const v = params.value;
      if (v === "member60")       return "חבר מרכז 60+";
      if (v === "registeredUser") return "משתמש רשום";
      return "-";
    },
  },

    {
      field: "capacity",
      headerName: "קיבולת",
      width: 90,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const count = Array.isArray(row.registrants) ? row.registrants.length : 0;
        return row.capacity ? `${count}/${row.capacity}` : "∞";
      },
    },
    {
      field: "recurring",
      headerName: "חוזרת?",
      width: 80,
      headerAlign: "center",
      align: "center",
      valueFormatter: ({ value }) => (value ? "כן" : "לא"),
    },
    {
      field: "actions",
      headerName: "פעולות",
      width: 280,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => onEdit(params.row)} sx={{ mr: 1 }}>
            ערוך
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(params.row)}
            sx={{ mr: 1 }}
          >
            מחק
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelAct(params.row)}
            sx={{ whiteSpace: "nowrap" }}
          >
            נרשמים
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container dir="rtl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          mb: 2,
          textAlign: "right",
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "right", width: "100%" }}>
          פעילויות
        </Typography>

      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => onTabChange(v)}
          sx={{ justifyContent: "flex-end" }}
        >
          <Tab label="רשימה" />
          <Tab label="לוח שנה" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button variant="contained" onClick={onNew} sx={{ mb: 2, ml: 2 }}>
            הוספת פעילות
          </Button>

          {/* שדה חיפוש */}
          <TextField
            placeholder="חפש לפי שם הפעילות"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
          />

          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={filteredList}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10]}
              getRowId={(r) => r.id ?? r.tempId}
                // 1. גובה שורה אוטומטי
              getRowHeight={() => 'auto'}
              // 2. כדי שגם המכולה עצמה תתאים את הגובה הכולל
              autoHeight
              sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', 
              },
              '& .multi-line-cell': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', 
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.3,
                paddingTop: '8px',
                paddingBottom: '8px',
              },
              '& .MuiDataGrid-row': {
                maxHeight: 'none !important',
              },
            }}
            />
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ mt: 2, textAlign: "right" }}>
          {/* עטיפה חדשה ל־ToggleButtonGroup + כפתורים "הוסף תגית" ו-"הסר תגית" */}
          <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,     // מרווח אופקי בין התגיות לכפתורים
    mb: 2,
  }}
>
  <ToggleButtonGroup
    exclusive
    value={tagFilter}
    onChange={(_, v) => setTagFilter(v || "ALL")}
  >
    <ToggleButton value="ALL">הכל</ToggleButton>
    {allTags.map((t) => (
      <ToggleButton key={t} value={t}>
        {t}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>

  {/* הכפתורים עכשיו ישר אחרי ה־ToggleButtonGroup, באותה שורה */}
  <Button
    variant="outlined"
    onClick={() => setNewTagDialogOpen(true)}
  >
    הוסף תגית
  </Button>
  <Button
    variant="outlined"
    color="error"
    onClick={() => setRemoveTagDialogOpen(true)}
  >
    הסר תגית
  </Button>
</Box>


          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            
            locale={heLocale}
            direction="rtl"
            events={events}
            dateClick={(info) => onDateClick(info.dateStr)}
            eventClick={(info) => onEventClick(info)}
            headerToolbar={{
              left: "today prev,next",
              center: "title",
              right: "",
            }}
            buttonIcons={false}
            height={600}
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={onClose}>
        <DialogTitle sx={{ textAlign: "right" }}>
          {form.id ? "עריכת פעילות" : "הוספת פעילות חדשה"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            pt: 1,
            minWidth: 400,
            textAlign: "right",
          }}
        >
          <TextField
            placeholder="שם הפעילות"
            value={form.name}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, name: e.target.value }))
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: { textAlign: "right", right: 0, left: "auto" },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
          />
          <TextField
            placeholder="תיאור"
            value={form.description}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, description: e.target.value }))
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: { textAlign: "right", right: 0, left: "auto" },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
          />

          {/* Autocomplete לבחירת תגיות בלבד */}
          <Autocomplete
            multiple
            options={allTags}
            getOptionLabel={(opt) => opt}
            value={form.tags || []}
            onChange={(_, newTags) =>
              onFormChange((f) => ({ ...f, tags: newTags }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="בחר תגיות"
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  ...params.inputProps,
                  dir: "rtl",
                  style: { textAlign: "right" },
                }}
                fullWidth
              />
            )}
            sx={{ textAlign: "right", right: 0, left: "auto" }}
          />

          <TextField
            label="תאריך"
            type="date"
            value={form.date}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, date: e.target.value }))
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                top: "-6px",
                right: "12px",
                transform: "none",
                backgroundColor: "#fff",
                px: 0.5,
                fontSize: "0.75rem",
              },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
          />
          <TextField
            label="שעת התחלה"
            type="time"
            variant="outlined"
            fullWidth
            value={form.startTime}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, startTime: e.target.value }))
            }
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                top: "-6px",
                right: "12px",
                transform: "none",
                backgroundColor: "#fff",
                px: 0.5,
                fontSize: "0.75rem",
              },
            }}
          />
          <TextField
            label="שעת סיום"
            type="time"
            variant="outlined"
            fullWidth
            value={form.endTime}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, endTime: e.target.value }))
            }
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                top: "-6px",
                right: "12px",
                transform: "none",
                backgroundColor: "#fff",
                px: 0.5,
                fontSize: "0.75rem",
              },
            }}
          />
          <TextField
            label="קיבולת"
            type="number"
            value={form.capacity}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, capacity: e.target.value }))
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                top: "-6px",
                right: "12px",
                transform: "none",
                backgroundColor: "#fff",
                px: 0.5,
                fontSize: "0.75rem",
              },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" }, min:1 }}
          />

          {/* שדה מחיר */}
          <TextField
            label="מחיר"
            type="number"
            value={form.price || ""}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, price: e.target.value }))
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                top: "-6px",
                right: "12px",
                transform: "none",
                backgroundColor: "#fff",
                px: 0.5,
                fontSize: "0.75rem",
              },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" }, min:0 }}
          />

         {/* שדה תנאי הרשמה */}
<TextField
  select
  label="תנאי הרשמה"
  value={form.registrationCondition || ""}
  onChange={(e) =>
    onFormChange((f) => ({ ...f, registrationCondition: e.target.value }))
  }
  fullWidth
  InputLabelProps={{
    shrink: true,
    sx: {
      position: "absolute",
      top: "-6px",
      right: "12px",
      transform: "none",
      backgroundColor: "#fff",
      px: 0.5,
      fontSize: "0.75rem",
    },
  }}
  inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
>
  <MenuItem value="member60">חבר מרכז 60+</MenuItem>
  <MenuItem value="registeredUser">משתמש רשום</MenuItem>
</TextField>


          {/* שדה מיקום */}
          <TextField
            label="מיקום"
            type="text"
            value={form.location || ""}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, location: e.target.value }))
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                top: "-6px",
                right: "12px",
                transform: "none",
                backgroundColor: "#fff",
                px: 0.5,
                fontSize: "0.75rem",
              },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
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
            sx={{
              width: "100%",
              justifyContent: "flex-end",
              flexDirection: "row-reverse",
            }}
          />
          {form.recurring && (
            <Box>
              <Typography sx={{ mb: 1, textAlign: "right" }}>
                בחר ימי שבוע חוזרים:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                {WEEKDAYS.map((d) => (
                  <FormControlLabel
                    key={d.value}
                    label={d.label}
                    sx={{ mr: 0 }}
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
        <DialogActions sx={{ justifyContent: "flex-end" }}>
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

      {/* דיאלוג הוספת תגית חדשה */}
      <Dialog
        open={newTagDialogOpen}
        onClose={() => setNewTagDialogOpen(false)}
      >
        <DialogTitle>הוספת תגית חדשה</DialogTitle>
        <DialogContent>
          <TextField
            label="שם תגית"
            fullWidth
            value={newTagValue}
            onChange={(e) => setNewTagValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTagDialogOpen(false)}>בטל</Button>
          <Button onClick={handleAddTag}>הוסף</Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג הסרת תגית */}
      <Dialog
        open={removeTagDialogOpen}
        onClose={() => setRemoveTagDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>בחר תגית להסרה</DialogTitle>
        <DialogContent dividers>
          {allTags.length === 0 && <Typography>אין תגיות להסרה.</Typography>}
          {allTags.map((t) => (
            <Box
              key={t}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
              }}
            >
              <Typography>{t}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveTag(t)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTagDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג נרשמים */}
    + <Dialog
   open={Boolean(selAct)}
   onClose={() => {
     setSelAct(null);
     setRegistrantsFilter("");
   }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: "right" }}>
          נרשמים – {selAct?.name}
        </DialogTitle>
<DialogContent dividers sx={{ textAlign: "right" }}>
  {/* 1. שדה חיפוש נרשמים */}
  {selAct?.participants?.length > 0 && (
    <TextField
      placeholder="חפש נרשם"
      value={registrantsFilter}
      onChange={(e) => setRegistrantsFilter(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
      inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
    />
  )}

  {/* 2. תצוגה של תוצאות החיפוש */}
  {filteredParticipants.length > 0 ? (
    <>
      {/* 2a. כותרת עמודת ה־Checkbox “שולם?” רק בפעילויות בתשלום */}
      {selAct?.price > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <span style={{ flex: 1 }} />
          <Typography sx={{ fontWeight: "bold", fontSize: 15 }}>
            שולם?
          </Typography>
          <span style={{ width: 60 }} />
        </Stack>
      )}

      {/* 2b. רשימת המשתתפים המסוננים */}
      {filteredParticipants.map((p) => (
        <Stack
          key={p.phone}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1}
          sx={{ mb: 1 }}
        >
          <span style={{ textAlign: "right", flex: 1 }}>
            {users[p.phone] || p.phone}
          </span>
          {selAct.price > 0 && (
            <Checkbox
              checked={p.paid || false}
              onChange={() => togglePaid(p.phone)}
              inputProps={{ "aria-label": "שולם?" }}
            />
          )}
          <IconButton onClick={() => kickParticipant(p.phone)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
    </>
  ) : (
    /* 3. אין תוצאות */
    "אין תוצאות"
  )}
</DialogContent>

    <DialogActions sx={{ justifyContent: "flex-end" }}>
  <Button
    onClick={() => {
      setSelAct(null);
      setRegistrantsFilter("");
    }}
  >
    סגור
  </Button>
</DialogActions>

      </Dialog>
    </Container>
  );
}
