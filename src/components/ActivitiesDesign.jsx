// src/components/ActivitiesDesign.jsx
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import React, { useState, useEffect, useMemo, useRef } from "react";

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
import { doc, collection, getDocs, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup, useMap  } from "react-leaflet";
// Leaflet & GeoSearch
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import * as XLSX from 'xlsx';


function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}
const WEEKDAYS = [
  { label: "א׳", value: 1 },
  { label: "ב׳", value: 2 },
  { label: "ג׳", value: 3 },
  { label: "ד׳", value: 4 },
  { label: "ה׳", value: 5 },
  { label: "ו׳", value: 6 },
  { label: "ש׳", value: 0 },
];

//freeSolo
const filter = createFilterOptions();

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

  const [allUsers, setAllUsers] = useState([]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map(doc => doc.data());
      setAllUsers(usersList);
    };

    fetchUsers();
  }, []);


  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  const [removeTagDialogOpen, setRemoveTagDialogOpen] = useState(false);

  // function to add a new tag
  const handleAddTag = () => {
    const tag = newTagValue.trim();
    if (tag && !allTags.includes(tag)) {
      setAllTags((prev) => [...prev, tag]);
    }
    setNewTagValue("");
    setNewTagDialogOpen(false);
  };

  // function to remove a tag
  const handleRemoveTag = (tagToRemove) => {
    
    setAllTags((prev) => prev.filter((t) => t !== tagToRemove));

    
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
  const [addressQuery, setAddressQuery] = useState("");
  // render map center and zoom
  const [mapCenter, setMapCenter] = useState([31.7683, 35.2137]);
  const [mapZoom, setMapZoom]     = useState(13);

  useEffect(() => {
    if (!selAct || !selAct.participants) return;

    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const userMap = {};

      snapshot.forEach((doc) => {
        const user = doc.data();
        if (user.phone) {
          userMap[user.phone] = user.fullname || user.name || "ללא שם";
        }
      });

      const participantDisplay = {};
      selAct.participants.forEach(({ phone, name }) => {
        const displayName = userMap[phone] || name || "ללא שם";
        participantDisplay[phone] = `${displayName} — ${phone}`;
      });

      setUsers(participantDisplay);
    };

    loadUsers();
  }, [selAct]);

  // יוצרת קובץ אקסל מכל הרשימה של activities
const exportToExcel = () => {
  // "מרחיבים" כל פעילות לשורות: אם יש מספר נרשמים, נייצר שורה לכל משתתף
  const rows = activities.flatMap(act => {
    if (Array.isArray(act.participants) && act.participants.length) {
      return act.participants.map(p => ({
        activityId: act.id,
        name: act.name,
        date: act.date,
        startTime: act.startTime,
        endTime: act.endTime,
        description: act.description,
        capacity: act.capacity,
        registrationCondition: act.registrationCondition,
        recurring: act.recurring ? 'כן' : 'לא',
        weekday: (act.weekdays || []).join(','),
        participantName: p.name,
        participantPhone: p.phone,
        paid: p.paid ? 'כן' : 'לא',
      }));
    } else {
      // אם אין נרשמים — שורה אחת עם שדות ריקים למשתתף
      return [{
        activityId: act.id,
        name: act.name,
        date: act.date,
        startTime: act.startTime,
        endTime: act.endTime,
        description: act.description,
        capacity: act.capacity,
        registrationCondition: act.registrationCondition,
        recurring: act.recurring ? 'כן' : 'לא',
        weekday: (act.weekdays || []).join(','),
        participantName: '',
        participantPhone: '',
        paid: '',
      }];
    }
  });

  // מייצרים גיליון עבודה וכתוב בו את המערך כטבלה
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Activities');

  // שומרים את הקובץ
  XLSX.writeFile(wb, 'activities_export.xlsx');
};

  // map reference and GeoSearch provider
  const mapRef = useRef(null);
  const geoProvider = new OpenStreetMapProvider();
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const control = new GeoSearchControl({
      provider: geoProvider,
      style: "bar",
      searchLabel: "הקלידו כתובת…",
      autoClose: true,
      retainZoomLevel: false,
    });
    map.addControl(control);
    map.on("geosearch/showlocation", ({ location }) => {
      const { x: lng, y: lat, label: address } = location;
      // update local state with the new address
      onFormChange((f) => ({ ...f, location: { address, lat, lng } }));
    });
    return () => {
      map.removeControl(control);
      map.off("geosearch/showlocation");
    };
  }, [geoProvider, onFormChange]);

  // search for participants based on the filter
const filteredParticipants = (selAct?.participants || []).filter((p) => {
  const label = (users[p.phone] || p.phone).toLowerCase();
  return label.includes(registrantsFilter.trim().toLowerCase());
});



  useEffect(() => {
  if (!selAct || !selAct.participants) return;

  console.log("First participant:", selAct.participants[0]);

  const map = {};
  (selAct.participants || []).forEach(({ phone, name }) => {
  const user = allUsers.find((u) => u.phone === phone);
  const displayName = user?.fullname || name || "ללא שם";
  map[phone] = `${displayName} — ${phone}`;
});


  setUsers(map);
}, [selAct]);



const kickParticipant = async (phone) => {
  // finds out the participant by phone
  const participant = selAct.participants.find((p) => p.phone === phone);
  if (!participant) return;

  // remove the participant from the activity in Firestore
  const actRef = doc(db, "activities", selAct.id);
  await updateDoc(actRef, {
    participants: arrayRemove(participant)
  });

  // update local state to remove the participant
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
  
  await updateDoc(actRef, { participants: arrayRemove(participant) });
  
  await updateDoc(actRef, { participants: arrayUnion(updated) });
  
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


  // sync all tags with local state
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
        <Box sx={{ mt: 2, textAlign: "right",  }}>

          <Button variant="contained" onClick={onNew} sx={{ mb: 2, ml: 2 }}>
            הוספת פעילות
          </Button>

          <Button
  variant="outlined"
  onClick={exportToExcel}
  sx={{ mb: 2, ml: 2 }}
>
  ייצוא לאקסל
</Button>


          
   {/* add or remove tag*/}
   <Box
     sx={{
       display: "flex",
       alignItems: "center",
       gap: 1,
       mb: 2
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


          {/* search field */}
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
                
              getRowHeight={() => 'auto'}
              
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
          {/* buttons for adding/removing tags */}
          <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,     
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

  {/* toggle buttons for adding/removing tags */}
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

      <Dialog
        open={dialogOpen}
        onClose={() => {
          // reset search field and map
          setAddressQuery("");
          setMapCenter([31.7683, 35.2137]);
          setMapZoom(13);
          onClose();
        }}
      >        <DialogTitle sx={{ textAlign: "right" }}>
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
            multiline
            minRows={3}
            maxRows={8}
            InputLabelProps={{
              shrink: true,
              sx: { textAlign: "right", right: 0, left: "auto" },
            }}
            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
          />

<Autocomplete
  freeSolo
  multiple
  options={allTags}
  filterOptions={(options, params) => {
    const filtered = filter(options, params);
    const { inputValue } = params;
    // new input turns into a new option
    if (inputValue !== "") {
      filtered.push({
        inputValue,
        title: `Add "${inputValue}"`,
      });
    }
    return filtered;
  }}
  getOptionLabel={(option) => {
    
    if (typeof option === "string") {
      return option;
    }
    
    if (option.inputValue) {
      return option.inputValue;
    }
    
    return option;
  }}
  value={form.tags || []}
  onChange={(_, newValue) => {
    
    const tags = newValue.map((v) =>
      typeof v === "string" ? v : v.inputValue || v
    );
    onFormChange((f) => ({ ...f, tags }));
    
    tags.forEach((t) => {
      if (!allTags.includes(t)) {
        setAllTags((prev) => [...prev, t]);
      }
    });
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="בחר או כתוב תגית חדשה"
      required
      InputLabelProps={{ shrink: true }}
      fullWidth
      inputProps={{
        ...params.inputProps,
        dir: "rtl",
        style: { textAlign: "right" },
      }}
    />
  )}
  sx={{ textAlign: "right" }}
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

 {/* מחיר עבור חבר 60+ */}
 <TextField
   label="מחיר עבור חבר 60+"
   type="number"
   value={form.priceMember60}
   onChange={(e) =>
     onFormChange((f) => ({ ...f, priceMember60: e.target.value }))
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

 {/* מחיר עבור משתמש רגיל */}
 <TextField
   label="מחיר עבור משתמש רגיל"
   type="number"
   value={form.priceRegular}
   onChange={(e) =>
     onFormChange((f) => ({ ...f, priceRegular: e.target.value }))
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

         {/* register restriction*/}
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


          {/* look for address */}
          <TextField
            label="מיקום"
            placeholder="הקלידי כתובת ולחצי Enter"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && addressQuery.trim()) {
                const results = await geoProvider.search({ query: addressQuery });
                if (results.length > 0) {
                  const typedAddress = addressQuery; 
                  const { x: lng, y: lat } = results[0];

                  // Keep the input unchanged and save only the user input to form state
                  onFormChange((f) => ({
                    ...f,
                    location: { address: typedAddress, lat, lng },
                  }));
                  // update map state
                  setMapCenter([lat, lng]);
                  setMapZoom(15);
                }
              }
            }}
            fullWidth
            sx={{ mb: 2 }}
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

{/* update map state */}
<MapContainer
  center={[31.7683, 35.2137]}
  zoom={13}
  style={{ height: 300, width: "100%", marginBottom: 16 }}
  whenCreated={(map) => (mapRef.current = map)}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Recenter center={mapCenter} zoom={mapZoom} />
  {form.location?.lat && (
    <Marker position={[form.location.lat, form.location.lng]}>
      <Popup>{form.location.address}</Popup>
    </Marker>
  )}
</MapContainer>


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
          <Button
            onClick={() => {
              // reset search field and map
              setAddressQuery("");
              setMapCenter([31.7683, 35.2137]);
              setMapZoom(13);
              onClose();
            }}
          >
            בטל
          </Button>
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

      {/* dialog for adding new tag */}
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

      {/* dialog for removing tag */}
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

      {/* dialog for participants */}
     <Dialog
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
  {/* 1. search field */}
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

  {/* 2. display search results */}
  {filteredParticipants.length > 0 ? (
    <>
      {/* 2a. Checkbox column header “Paid?” only for paid activities */}
      {(selAct?.priceMember60 > 0 || selAct?.priceRegular > 0) && (
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

      {/* 2b. list of filtered participants */}
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
          {(selAct?.priceMember60 > 0 || selAct?.priceRegular > 0) && (
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
    /* 3. no results */
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
