// src/components/FlyerUploaderArea.jsx
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CtaButton from "../LandingPage/CtaButton";
import ActivityService from "../services/ActivityService";
import FlyerService from "../services/FlyerService.js";
import ActionFeedbackDialog from "./ActionFeedbackDialog";

export default function FlyerUploaderArea({ onUpload }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState("");
  const dropRef = useRef();
  const [message, setMessage] = useState({ open: false, text: "", type: "success" });

  useEffect(() => {
    const unsub = ActivityService.subscribe((acts) => setActivities(acts));
    return () => unsub();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
    dropRef.current.style.borderColor = theme.palette.primary.main;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = theme.palette.primary.dark;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = theme.palette.divider;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !file) {
      setMessage({ open: true, type: "error", text: "יש להזין שם וקובץ" });
      return;
    }

    if (!activityId) {
      setMessage({ open: true, type: "error", text: "יש לבחור פעילות" });
      return;
    }

    if (endDate && startDate && endDate < startDate) {
      setMessage({ open: true, type: "error", text: "תאריך סיום חייב להיות אחרי תאריך התחלה" });
      return;
    }

    try {
      await FlyerService.uploadFlyer({ name, file, startDate, endDate, activityId });

      setName("");
      setFile(null);
      setStart("");
      setEnd("");
      setActivityId("");
      setMessage({ open: true, type: "success", text: "הפלייר נשמר בהצלחה" });

      onUpload?.();
    } catch (err) {
      console.error(err);
      setMessage({ open: true, type: "error", text: "העלאה נכשלה: " + (err.code || err.message) });
    }
  };


  return (
    <Box
      sx={{
        direction: "rtl",
        maxWidth: 480,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        העלאת פלייר
      </Typography>

      <Stack spacing={isMobile ? 2 : 3}>
        {/*flyer name*/}
        <TextField
          label="שם הפלייר"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* choose ac*/}
        <FormControl fullWidth>
          <InputLabel id="activity-select-label">בחרי פעילות</InputLabel>
          <Select
            labelId="activity-select-label"
            label="בחרי פעילות"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
          >
            <MenuItem value="">
              <em>-- ללא פעילות --</em>
            </MenuItem>
            {activities.map((act) => (
              <MenuItem key={act.id} value={act.id}>
                {act.name} &mdash; {act.date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* dates*/}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="הצג החל מ־"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={startDate}
            onChange={(e) => setStart(e.target.value)}
          />
          <TextField
            label="ועד (כולל)"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={endDate}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Stack>

        {/* Drop area */}
        <Box
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            p: 3,
            textAlign: "center",
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: theme.palette.grey[50],
            position: "relative",
            overflow: "hidden",
            "& input[type='file']": {
              position: "absolute",
              top: 0, left: 0, width: "100%", height: "100%",
              opacity: 0, cursor: "pointer",
            },
          }}
        >
          {file ? (
            <Typography>{file.name}</Typography>
          ) : (
            <Typography color="text.secondary">
              גרור קובץ לכאן או לחצי כדי לבחור
            </Typography>
          )}
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
        </Box>

        {/*  save button*/}
        <CtaButton
          onClick={handleSubmit}
          disabled={!name.trim() || !file || !activityId}
          fullWidth
          sx={{ mt: 1 }}
        >
          שמור פלייר
        </CtaButton>
      </Stack>

      <ActionFeedbackDialog
        open={message.open}
        type={message.type}
        text={message.text}
        onClose={() => setMessage(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
}
