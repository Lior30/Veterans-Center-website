// src/components/MessagesSection.jsx
import ArticleIcon from "@mui/icons-material/Article";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useRef, useState } from "react";
import CtaButton from "./CtaButton";
import SectionTitle from "./SectionTitle";

/* — MESSAGE CARD — */
const UpdateCard = styled(Card)(({ theme }) => ({
  position: "relative",
  flex: "0 0 auto",
  width: "var(--msg-card-width)",
  minHeight: 150,
  display: "flex",
  flexDirection: "column",
  borderRadius: "20px",
  overflow: "visible",
  background: "#ffffffee",
  border: "1px solid #e0d7ec",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
  transition: "transform .25s, box-shadow .25s",
  cursor: "pointer",
  backdropFilter: "blur(2px)",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 6,
    borderRadius: "8px",
    background: "linear-gradient(180deg,#ab47bc,#7e57c2)",
  },
}));

/* — SCROLL ARROWS — */
const ScrollButton = styled(IconButton)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: "50%",
  color: "#fff",
  background: "linear-gradient(135deg,#ab47bc,#7e57c2)",
  boxShadow: "0 4px 12px rgba(123,31,162,0.3)",
  backdropFilter: "blur(4px)",
  "&:hover": {
    background: "linear-gradient(135deg,#8e24aa,#5e35b1)",
    boxShadow: "0 6px 16px rgba(123,31,162,0.4)",
  },
}));

function linkify(text) {
  const urlRegex = /(\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:[^\s]*)?)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    const isLink = urlRegex.test(part);
    const hasProtocol = /^https?:\/\//i.test(part);
    const href = hasProtocol ? part : `https://${part}`;

    return isLink ? (
      <a
        key={index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#6a1b9a", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    );
  });
}

export default function MessagesSection({ messages, openDialog, justIdentified }) {
  const [expanded, setExpanded] = useState({});
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const cardWidth = isMobile ? 260 : 340;
  const scrollDelta = cardWidth + 20;

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const scroll = (dx) => scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <Box
      component="section"
      sx={{
        "--msg-card-width": `${cardWidth}px`,
        py: { xs: 3, sm: 5 },
        backgroundColor: "#fff",
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
              left: 0,
              transform: "translate(-50%, -50%)",
              top: "50%",
              zIndex: 2,
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
              pr: { xs: theme.spacing(6), sm: theme.spacing(4) },
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": { display: "none" },
              alignItems: "stretch",
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
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: "100%" }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.05rem" },
                        color: "#4a148c",
                        lineHeight: 1.3,
                        mb: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.5,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        cursor: tooLong ? "pointer" : "default",
                      }}
                      onClick={() => tooLong && toggleExpanded(m.id)}
                    >
                      {linkify(shownTxt)}
                    </Typography>

                    <Box mt={2} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
              right: 0,
              transform: "translate(50%, -50%)",
              top: "50%",
              zIndex: 2,
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </ScrollButton>
        </Box>
      </Container>
    </Box>
  );
}
