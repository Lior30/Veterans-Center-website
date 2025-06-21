// src/components/MessagesSection.jsx
// – Responsive style tweaks + theme colours – //
import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";

/* — MESSAGE CARD — */
const UpdateCard = styled(Card)(({ theme }) => ({
  position: "relative",
  flex: "0 0 auto",
  width: "var(--msg-card-width)",
  minHeight: 140,                                           // היה 160
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,          // שימוש ברקע theme
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  transition: "transform .25s, box-shadow .25s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 4,
    background: theme.palette.primary.main,
  },
}));

/* — SCROLL ARROWS — */
const ScrollButton = styled(IconButton)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: "50%",
  color: "#fff",
  background: `linear-gradient(135deg,${theme.palette.primary.dark} 0%,${theme.palette.primary.main} 100%)`,
  boxShadow: "0 3px 10px rgba(106,27,154,.35)",
  backdropFilter: "blur(6px)",
  "&:hover": {
    background: `linear-gradient(135deg,${theme.palette.primary.dark} 0%,${theme.palette.primary.light} 100%)`,
  },
  [theme.breakpoints.down("sm")]: {
    width: 34,
    height: 34,
    boxShadow: "0 2px 6px rgba(106,27,154,.3)",
  },
}));

export default function MessagesSection({ messages, openDialog, justIdentified }) {
  const [expanded, setExpanded] = useState({});
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const cardWidth = isMobile ? 240 : 320;
  const scrollDelta = cardWidth + 18;

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const scroll = (dx) => scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <Box
      component="section"
      sx={{
        "--msg-card-width": `${cardWidth}px`,
        py: { xs: 3, sm: 4 },                                   // פחות גובה
        backgroundColor: theme.palette.primary.vlight,          // צבע רקע אחיד מה-theme
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <SectionTitle icon={<ArticleIcon />} title="הודעות" />

        <Box sx={{ position: "relative", mt: 3 }}>
          {/* LEFT ARROW */}
          <ScrollButton
            onClick={() => scroll(-scrollDelta)}
            sx={{
              position: "absolute",
              left: { xs: -14, sm: -20 },
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </ScrollButton>

          {/* SCROLL TRACK */}
          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              gap: theme.spacing(2),
              overflowX: "auto",
              pr: { xs: theme.spacing(3), sm: theme.spacing(4) },
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": { display: "none" },
              alignItems: "center",                              // הוסר minHeight
            }}
          >
            {messages.map((m) => {
              const isOpen = !!expanded[m.id];
              const txt = m.body || "";
              const cutoff = 90;
              const tooLong = txt.length > cutoff;
              const shownTxt = isOpen ? txt : tooLong ? txt.slice(0, cutoff) + "…" : txt;

              return (
                <UpdateCard key={m.id} sx={{ scrollSnapAlign: "start" }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                      noWrap
                      sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                    >
                      {m.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.45,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        cursor: tooLong ? "pointer" : "default",
                      }}
                      onClick={() => tooLong && toggleExpanded(m.id)}
                    >
                      {shownTxt}
                    </Typography>

                    <Box mt={1.5} sx={{ display: "flex", gap: 1 }}>
                      {tooLong && (
                        <CtaButton
                          color="primary"
                          size="small"
                          onClick={() => toggleExpanded(m.id)}
                        >
                          {isOpen ? "קרא פחות" : "קרא עוד"}
                        </CtaButton>
                      )}
                      {justIdentified && (
                        <CtaButton
                          color="primary"
                          size="small"
                          onClick={() => openDialog("message", m.id)}
                        >
                          השב
                        </CtaButton>
                      )}
                    </Box>
                  </CardContent>
                </UpdateCard>
              );
            })}
          </Box>

          {/* RIGHT ARROW */}
          <ScrollButton
            onClick={() => scroll(scrollDelta)}
            sx={{
              position: "absolute",
              right: { xs: -14, sm: -20 },
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </ScrollButton>
        </Box>
      </Container>
    </Box>
  );
}
