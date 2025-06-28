// ✅ הקובץ HomepageImagesDesign.jsx לאחר הסרה של שדה הסדר ותמיכה רק בגרירה
import React, { useState, useRef } from "react";
import CtaButton from "../LandingPage/CtaButton";
import BannerService from "../services/BannerService.js";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Stack,
  Box,
  Grid,
  Button,
} from "@mui/material";

function BannerUploader({ onUpload, setMessage }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const dropRef = useRef();

  const onFileChange = (e) => setFile(e.target.files[0]);
  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
    dropRef.current.style.borderColor = "";
  };
  const onDragOver = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = "#673ab7";
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = "";
  };

  async function handleSubmit() {
    if (!title.trim() || !file) {
      setMessage({
        open: true,
        type: 'error',
        text: "חובה להעלות קובץ, ולתת לו שם ",
      });
      return;
    }
    if (end && start && end < start) {
      setMessage({
        open: true,
        type: 'error',
        text: "שגיאה: תאריך סיום לפני תאריך התחלה",
      });
      return;
    }
    try {
      await BannerService.uploadBanner({
        title,
        file,
        link: "",
        start,
        end,
      });
      setTitle("");
      setFile(null);
      setStart("");
      setEnd("");
      onUpload?.();

      setMessage({
        open: true,
        type: 'success',
        text: "התמונה עלתה בהצלחה",
      });

    } catch (err) {
      alert("העלאה נכשלה: " + err.code);
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 6, maxWidth: 500, mx: "auto", bgcolor: "background.paper" }}>
      <Typography variant="h6" gutterBottom>העלאת תמונה חדשה</Typography>
      <Stack spacing={2}>
        <TextField label="שם " fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
        <Stack direction="row" spacing={2}>
          <TextField label="הצג החל מ־" type="date" fullWidth InputLabelProps={{ shrink: true }} value={start} onChange={(e) => setStart(e.target.value)} />
          <TextField label="עד (כולל)" type="date" fullWidth InputLabelProps={{ shrink: true }} value={end} onChange={(e) => setEnd(e.target.value)} />
        </Stack>
        <Box ref={dropRef} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} sx={{ p: 3, border: "2px dashed", borderColor: "divider", borderRadius: 2, textAlign: "center", bgcolor: "background.default" }}>
          <Typography variant="body2" color="text.secondary">
            {file ? `קובץ: ${file.name}` : "גרור תמונה לכאן או בחר ידנית"}
          </Typography>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ marginTop: 8 }} />
        </Box>
        <Box textAlign="center">
          <CtaButton onClick={handleSubmit}>שמור</CtaButton>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function HomepageImagesDesign({ banners, onUpload, onDelete, onDragStart, onDragEnter, setMessage  }) {
  return (
    <Container maxWidth="lg">
      <BannerUploader onUpload={onUpload} setMessage={setMessage} />
      <Typography variant="h6" align="center" gutterBottom>
        תמונות קיימות
      </Typography>
      {banners.length === 0 && (
        <Typography align="center" color="text.secondary">
          אין עדיין תמונות.
        </Typography>
      )}
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {banners
          .sort((a, b) => a.order - b.order)
          .map((banner, idx) => (
            <Grid item key={banner.id}>
              <Box component="div" draggable onDragStart={(e) => onDragStart(e, idx)} onDragEnter={(e) => onDragEnter(e, idx)}
                sx={{ width: 240, p: 2, position: "relative", bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", textAlign: "center", cursor: "grab", "&:hover": { boxShadow: 6 } }}>
                <Box component="img" src={banner.url} alt={banner.title} sx={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 1 }} />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>{banner.title}</Typography>
                <Button variant="contained" color="error" onClick={() => onDelete(banner)} fullWidth sx={{ mt: 1 }}>מחק</Button>
              </Box>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
}
