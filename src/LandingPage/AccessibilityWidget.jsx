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
  styled,
} from "@mui/material";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import CloseIcon from "@mui/icons-material/Close";

export default function AccessibilityWidget() {
  const theme = useTheme();
  const purple = theme.palette.primary.main;

  /* ─────────── styled helpers ─────────── */
  const FloatingBtn = styled(IconButton)(({ theme }) => ({
    backgroundColor: "#fff",
    color: purple,
    border: `2px solid ${purple}`,
    borderRadius: "50%",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    padding: 10,
    transition: "transform 0.2s",
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? "#f1f1f1" : "#303030",
      transform: "scale(1.05)",
    },
  }));

  const DrawerContent = styled(Box)(({ theme }) => ({
    width: 300,
    maxWidth: "80vw",
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  }));

  const SectionCaption = styled(Typography)({
    fontWeight: 600,
    marginBottom: 4,
  });

  const AccentBtn = styled(Button)({
    flex: 1,
    borderColor: purple,
    color: purple,
    "&:hover": { borderColor: purple, backgroundColor: purple + "10" },
  });

  /* ─────────── state ─────────── */
  const [open, setOpen] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(
    () => JSON.parse(localStorage.getItem("access_keyboardNav")) || false
  );
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

  /* ─────────── DOM updates & persistence ─────────── */
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("access_fontSize", fontSize);
  }, [fontSize]);

  const toggleClass = (cls, enabled) => {
    const root = document.documentElement;
    enabled ? root.classList.add(cls) : root.classList.remove(cls);
  };

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

  /* ─────────── skip-link helper ─────────── */
  const skipToContent = () => {
    // יעד ברירת מחדל – element עם id="main-content" ואם לא קיים ננסה ספציפי ללוח.
    const target =
      document.getElementById("main-content") ||
      document.getElementById("calendar-view");
    if (target) {
      target.setAttribute("tabindex", "-1"); // מוודא שניתן לקבל פוקוס
      target.focus({ preventScroll: false });
    }
  };

  /* ─────────── screen-reading helpers ─────────── */
  const startReading = () => {
    if (speechUtterance.current) return;
    const text =
      document.getElementById("main-content")?.innerText ||
      document.body.innerText;
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

  /* ─────────── keyboard shortcuts ─────────── */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!keyboardNav) return;
      if (e.key === "Escape") setOpen(false);
      if (e.altKey && e.key.toLowerCase() === "m") setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboardNav]);

  /* ─────────── render ─────────── */
  return (
    <>
      {/* כפתור צף */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: theme.zIndex.tooltip,
        }}
      >
        <FloatingBtn aria-label="פתח תפריט נגישות" onClick={() => setOpen(true)}>
          <AccessibilityNewIcon fontSize="medium" />
        </FloatingBtn>
      </Box>

      {/* Drawer נגישות */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <DrawerContent>
  {/* סרגל כותרת עם כפתור סגירה */}
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Typography variant="h6">נגישות</Typography>

    <IconButton
      aria-label="סגור"
      size="small"
      onClick={() => setOpen(false)}
      sx={{ color: theme.palette.text.secondary }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>

  <Divider />


          <Button
            variant="outlined"
            fullWidth
            sx={{ borderRadius: 2 }}
            onClick={skipToContent}
          >
            דלג לתוכן העיקרי
          </Button>

          {/* גודל גופן */}
          <SectionCaption variant="subtitle2">גודל גופן</SectionCaption>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setFontSize((prev) => Math.max(12, +prev - 2).toString())
              }
            >
              –
            </Button>
            <Typography minWidth={32} textAlign="center">
              {fontSize}px
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setFontSize((prev) => Math.min(32, +prev + 2).toString())
              }
            >
              +
            </Button>
          </Stack>

          {/* ריווח שורות */}
          <SectionCaption variant="subtitle2">ריווח שורות</SectionCaption>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setLineHeight((prev) => (+prev - 0.1).toFixed(1))}
            >
              –
            </Button>
            <Typography minWidth={32} textAlign="center">
              {lineHeight}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setLineHeight((prev) => (+prev + 0.1).toFixed(1))}
            >
              +
            </Button>
          </Stack>

          {/* ריווח אותיות */}
          <SectionCaption variant="subtitle2">ריווח אותיות</SectionCaption>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setLetterSpacing((prev) =>
                  Math.max(0, +prev - 0.5).toString()
                )
              }
            >
              –
            </Button>
            <Typography minWidth={32} textAlign="center">
              {letterSpacing}px
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setLetterSpacing((prev) =>
                  Math.min(5, +prev + 0.5).toString()
                )
              }
            >
              +
            </Button>
          </Stack>

          <Divider />

          {/* מתגים */}
          <FormControlLabel
            control={
              <Switch
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
            }
            label="ניגודיות גבוהה"
          />
          <FormControlLabel
            control={
              <Switch
                checked={grayscale}
                onChange={(e) => setGrayscale(e.target.checked)}
              />
            }
            label="גווני אפור"
          />
          <FormControlLabel
            control={
              <Switch
                checked={invert}
                onChange={(e) => setInvert(e.target.checked)}
              />
            }
            label="היפוך צבעים"
          />
          <FormControlLabel
            control={
              <Switch
                checked={disableAnimations}
                onChange={(e) => setDisableAnimations(e.target.checked)}
              />
            }
            label="כבה אנימציות"
          />
          <FormControlLabel
            control={
              <Switch
                checked={underlineLinks}
                onChange={(e) => setUnderlineLinks(e.target.checked)}
              />
            }
            label="הדגש קישורים"
          />
          <FormControlLabel
            control={
              <Switch
                checked={keyboardNav}
                onChange={(e) => setKeyboardNav(e.target.checked)}
              />
            }
            label="ניווט מקלדת"
          />

          <Divider />

          {/* קריינות */}
          <Stack direction="row" spacing={1}>
            <AccentBtn variant="outlined" onClick={startReading}>
              הפעל קריינות
            </AccentBtn>
            <AccentBtn variant="outlined" onClick={stopReading}>
              עצור
            </AccentBtn>
          </Stack>
        </DrawerContent>
      </Drawer>
    </>
  );
}
