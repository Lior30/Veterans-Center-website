// src/components/HomepageImagesDesign.jsx
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";


function BannerUploader({ onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(5);
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
      alert("שם וקובץ חובה");
      return;
    }
    if (end && start && end < start) {
      alert("תאריך סיום לפני תאריך התחלה");
      return;
    }
    try {
      await BannerService.uploadBanner({
        title,
        file,
        link: "",
        start,
        end,
        durationSec: Number(duration) || 5,
      });
      setTitle("");
      setFile(null);
      setStart("");
      setEnd("");
      setDuration(5);
      onUpload?.();
    } catch (err) {
      alert("העלאה נכשלה: " + err.code);
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mb: 6,
        maxWidth: 500,
        mx: "auto",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" gutterBottom>
העלאת תמונה חדשה    
  </Typography>

      <Stack spacing={2}>
        <TextField
          label="שם "
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="הצג החל מ־"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <TextField
            label="עד (כולל)"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Stack>

        <TextField
          label="משך הצגה (שניות)"
          type="number"
          inputProps={{ min: 1 }}
          fullWidth
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <Box
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          sx={{
            p: 3,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {file ? `קובץ: ${file.name}` : "גרור תמונה לכאן או בחר ידנית"}
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            style={{ marginTop: 8 }}
          />
        </Box>

        <Box textAlign="center">
          <CtaButton onClick={handleSubmit}>שמור </CtaButton>
        </Box>
      </Stack>
    </Paper>
  );
}


export default function HomepageImagesDesign({
  banners,
  onUpload,
  onDelete,
  onDragStart,
  onDragEnter,
  onDurationChange,
  onDurationBlur,
}) {
  return (
    <Container maxWidth="lg">
      {/* Uploader */}
      <BannerUploader onUpload={onUpload} />

      {/* Title */}
      <Typography variant="h6" align="center" gutterBottom>
        תמונות קיימות
      </Typography>
      {banners.length === 0 && (
        <Typography align="center" color="text.secondary">
          אין עדיין תמונות.
        </Typography>
      )}

      {/* Grid of banners */}
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {banners.map((banner, idx) => (
          <Grid item key={banner.id}>
            <Box
              component="div"
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragEnter={(e) => onDragEnter(e, idx)}
              sx={{
                width: 240,
                p: 2,
                position: "relative",
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
                cursor: "grab",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Box
                component="img"
                src={banner.url}
                alt={banner.title}
                sx={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />

              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                {banner.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                סדר: {banner.order}
              </Typography>

              <TextField
                variant="outlined"
                size="small"
                label="משך"
                type="number"
                inputProps={{ min: 1 }}
                value={banner.durationSec}
                onChange={(e) =>
                  onDurationChange(banner.id, Number(e.target.value))
                }
                onBlur={(e) =>
                  onDurationBlur(banner.id, Number(e.target.value))
                }
                sx={{ mt: 1, width: 100 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">שניות</InputAdornment>
                  ),
                }}
              />

              <IconButton
                size="small"
                onClick={() => onDelete(banner)}
                sx={{ position: "absolute", top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
