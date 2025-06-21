// src/components/MessagesSection.jsx
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

/* — כרטיס הודעה — */
const UpdateCard = styled(Card)(({ theme }) => ({
  position: "relative",
  flex: "0 0 auto",
  width: "var(--msg-card-width)",
  minHeight: 160,
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  background: "linear-gradient(135deg,#ffffff 0%,#f5f5ff 100%)",
  boxShadow: "0 3px 10px rgba(0,0,0,.08)",
  transition: "transform .25s, box-shadow .25s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 18px rgba(0,0,0,.15)",
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

/* — חיצי גלילה — */
const ScrollButton = styled(IconButton)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: "50%",
  color: "#fff",
  background: "linear-gradient(135deg,#8e24aa 0%,#6a1b9a 100%)",
  boxShadow: "0 3px 10px rgba(106,27,154,.35)",
  backdropFilter: "blur(6px)",
  "&:hover": {
    background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)",
  },
}));

export default function MessagesSection({ messages, openDialog, justIdentified }) {
  const [expanded, setExpanded] = useState({});
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const cardWidth   = isMobile ? 240 : 320;
  const scrollDelta = cardWidth + 18;

  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const scroll = (dx) =>
    scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <Box
      component="section"
      sx={{
        "--msg-card-width": `${cardWidth}px`,
        py: { xs: 4, sm: 5 },
        background: "linear-gradient(180deg,#f7f3ff 0%, #efe7ff 100%)",
      }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<ArticleIcon />} title="הודעות" />

        <Box sx={{ position: "relative", mt: 3 }}>
          {/* חץ שמאלה */}
          <ScrollButton
            onClick={() => scroll(-scrollDelta)}
            sx={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)" }}
          >
            <ChevronLeftIcon />
          </ScrollButton>

          {/* פס הגלילה */}
          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              gap: theme.spacing(2),
              overflowX: "auto",
              pr: theme.spacing(4),
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": { display: "none" },
              minHeight: 280,
              alignItems: "center",
            }}
          >
            {messages.map((m) => {
              const isOpen   = !!expanded[m.id];
              const txt      = m.body || "";
              const cutoff   = 90;
              const tooLong  = txt.length > cutoff;
              const shownTxt = isOpen ? txt : tooLong ? txt.slice(0, cutoff) + "…" : txt;

              return (
                <UpdateCard key={m.id}>
                  <CardContent sx={{ p: 2, scrollSnapAlign: "start" }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
                      {m.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.45,
                        cursor: tooLong ? "pointer" : "default",
                      }}
                      onClick={() => tooLong && toggleExpanded(m.id)}
                    >
                      {shownTxt}
                    </Typography>

                    <Box mt={1.5}>
                      {tooLong && (
                        <CtaButton
                          color="tertiary"
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
                          sx={{ ml: 1 }}
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

          {/* חץ ימינה */}
          <ScrollButton
            onClick={() => scroll(scrollDelta)}
            sx={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)" }}
          >
            <ChevronRightIcon />
          </ScrollButton>
        </Box>
      </Container>
    </Box>
  );
}
