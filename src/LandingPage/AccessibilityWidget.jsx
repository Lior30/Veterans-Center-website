// src/components/AccessibilityWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  useTheme,
  Box,
  IconButton,
  Drawer,
  Typography,
  Button,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

export default function AccessibilityWidget() {
  const theme = useTheme();
  const purple = theme.palette.primary.main;

  // drawer ומצבים
  const [open, setOpen] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(
    () => JSON.parse(localStorage.getItem("access_keyboardNav")) || false
  );
  // שאר מצבי הנגישות
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("access_fontSize") || "16"
  );
  const [highContrast, setHighContrast] = useState(
    () => JSON.parse(localStorage.getItem("access_highContrast")) || false
  );
  const [grayscale, setGrayscale] = useState(
    () => JSON.parse(localStorage.getItem("access_grayscale")) || false
  );
  const [invert, setInvert] = useState(
    () => JSON.parse(localStorage.getItem("access_invert")) || false
  );
  const [disableAnimations, setDisableAnimations] = useState(
    () => JSON.parse(localStorage.getItem("access_disableAnimations")) || false
  );
  const [underlineLinks, setUnderlineLinks] = useState(
    () => JSON.parse(localStorage.getItem("access_underlineLinks")) || false
  );
  const [lineHeight, setLineHeight] = useState(
    () => localStorage.getItem("access_lineHeight") || "1.5"
  );
  const [letterSpacing, setLetterSpacing] = useState(
    () => localStorage.getItem("access_letterSpacing") || "0"
  );
  const speechUtterance = useRef(null);

  // שמירת הגדרות ושינוי DOM
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("access_fontSize", fontSize);
  }, [fontSize]);
  useEffect(() => {
    toggleClass("high-contrast", highContrast);
    localStorage.setItem("access_highContrast", JSON.stringify(highContrast));
  }, [highContrast]);
  useEffect(() => {
    toggleClass("grayscale", grayscale);
    localStorage.setItem("access_grayscale", JSON.stringify(grayscale));
  }, [grayscale]);
  useEffect(() => {
    toggleClass("invert-colors", invert);
    localStorage.setItem("access_invert", JSON.stringify(invert));
  }, [invert]);
  useEffect(() => {
    toggleClass("no-animations", disableAnimations);
    localStorage.setItem(
      "access_disableAnimations",
      JSON.stringify(disableAnimations)
    );
  }, [disableAnimations]);
  useEffect(() => {
    toggleClass("underline-links", underlineLinks);
    localStorage.setItem(
      "access_underlineLinks",
      JSON.stringify(underlineLinks)
    );
  }, [underlineLinks]);
  useEffect(() => {
    toggleClass("keyboard-nav", keyboardNav);
    localStorage.setItem("access_keyboardNav", JSON.stringify(keyboardNav));
  }, [keyboardNav]);
  useEffect(() => {
    document.body.style.lineHeight = lineHeight;
    localStorage.setItem("access_lineHeight", lineHeight);
  }, [lineHeight]);
  useEffect(() => {
    document.body.style.letterSpacing = `${letterSpacing}px`;
    localStorage.setItem("access_letterSpacing", letterSpacing);
  }, [letterSpacing]);

  // Toggle מחלקת CSS
  const toggleClass = (cls, enabled) => {
    const root = document.documentElement;
    enabled ? root.classList.add(cls) : root.classList.remove(cls);
  };

  // קריינות בעברית
  const startReading = () => {
    if (speechUtterance.current) return;
    const text =
      document.getElementById("main-content")?.innerText || document.body.innerText;
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utt.voice = voices.find((v) => v.lang.startsWith("he")) || voices[0];
    utt.lang = "he-IL";
    utt.rate = 1;
    utt.pitch = 1;
    speechUtterance.current = utt;
    window.speechSynthesis.speak(utt);
  };
  const stopReading = () => {
    window.speechSynthesis.cancel();
    speechUtterance.current = null;
  };

  // דילוג לתוכן
 const skipToContent = () => {
  const calendar = document.getElementById("calendar-view");
  calendar?.focus();
};


  // מאזין מקלדת: Esc לסגירה, Alt+M לפתיחה
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!keyboardNav) return;
      if (e.key === "Escape") setOpen(false);
      if (e.altKey && e.key.toLowerCase() === "m") setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboardNav]);

  return (
    <>
      {/* כפתור נגישות צף קבוע */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: theme.zIndex.tooltip,
        }}
      >
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: "#fff",
            color: purple,
            border: `2px solid ${purple}`,
            borderRadius: "50%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            p: 1,
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          <AccessibilityNewIcon />
        </IconButton>
      </Box>

      {/* תפריט נגישות */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            נגישות
          </Typography>
          <Divider sx={{ my: 1 }} />

          <Button fullWidth onClick={skipToContent} sx={{ mb: 1 }}>
            דלג לתוכן העיקרי
          </Button>

          {/* גודל גופן */}
          <Typography variant="subtitle2">גודל גופן</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button size="small" onClick={() => setFontSize(prev => Math.max(12, +prev - 2).toString())}>
              הקטן
            </Button>
            <Typography>{fontSize}px</Typography>
            <Button size="small" onClick={() => setFontSize(prev => Math.min(32, +prev + 2).toString())}>
              הגדל
            </Button>
          </Stack>

          {/* ריווח שורות */}
          <Typography variant="subtitle2">ריווח שורות</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button size="small" onClick={() => setLineHeight(prev => (+prev - 0.1).toFixed(1))}>
              הקטן
            </Button>
            <Typography>{lineHeight}</Typography>
            <Button size="small" onClick={() => setLineHeight(prev => (+prev + 0.1).toFixed(1))}>
              הגדל
            </Button>
          </Stack>

          {/* ריווח אותיות */}
          <Typography variant="subtitle2">ריווח אותיות</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button size="small" onClick={() => setLetterSpacing(prev => Math.max(0, +prev - 0.5).toString())}>
              הקטן
            </Button>
            <Typography>{letterSpacing}px</Typography>
            <Button size="small" onClick={() => setLetterSpacing(prev => Math.min(5, +prev + 0.5).toString())}>
              הגדל
            </Button>
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* מתגים */}
          <FormControlLabel
            control={<Switch checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />} label="ניגודיות גבוהה"
          />
          <FormControlLabel
            control={<Switch checked={grayscale} onChange={e => setGrayscale(e.target.checked)} />} label="גווני אפור"
          />
          <FormControlLabel
            control={<Switch checked={invert} onChange={e => setInvert(e.target.checked)} />} label="היפוך צבעים"
          />
          <FormControlLabel
            control={<Switch checked={disableAnimations} onChange={e => setDisableAnimations(e.target.checked)} />} label="כבה אנימציות"
          />
          <FormControlLabel
            control={<Switch checked={underlineLinks} onChange={e => setUnderlineLinks(e.target.checked)} />} label="הדגש קישורים"
          />
          <FormControlLabel
            control={<Switch checked={keyboardNav} onChange={e => setKeyboardNav(e.target.checked)} />} label="ניווט מקלדת"
          />

          <Divider sx={{ my: 1 }} />

          {/* קריינות */}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="outlined" onClick={startReading} sx={{ color: purple, borderColor: purple }}>
              הפעל קריינות
            </Button>
            <Button variant="outlined" onClick={stopReading} sx={{ color: purple, borderColor: purple }}>
              עצור קריינות
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

/* להוסיף ל-index.css:
.high-contrast { filter: contrast(200%) !important; background:#000!important; color:#fff!important; }
.grayscale { filter: grayscale(100%) !important; }
.invert-colors { filter: invert(100%) hue-rotate(180deg) !important; }
.no-animations * { animation:none!important; transition:none!important; }
.underline-links a { text-decoration:underline!important; }
.keyboard-nav *:focus { outline:2px dashed #91278F !important; outline-offset:2px; }
*/