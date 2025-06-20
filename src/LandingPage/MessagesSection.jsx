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

const UpdateCard = styled(Card)(({ theme }) => ({
  flex: "0 0 auto",
  width: 300,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "visible",
  backgroundColor: "#fff",
  boxShadow: theme.shadows[1],
  transition: "transform 0.3s, box-shadow 0.3s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[4],
  },
}));

export default function MessagesSection({ messages, openDialog, justIdentified }) {
  const [expanded, setExpanded] = useState({});
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const scrollAmount = isMobile ? 260 : 360;

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, bgcolor: "#f9f9f9" }}>
      <Container maxWidth="md">
        <SectionTitle icon={<ArticleIcon />} title="הודעות " />

        <Box sx={{ position: "relative", mt: 2 }}>
          <IconButton
            onClick={() => scroll(-scrollAmount)}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: theme.spacing(2),
              pr: theme.spacing(6),
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {messages.map((m) => {
              const isExpanded = !!expanded[m.id];
              const preview = m.body || "";
              const charLimit = 100;
              const needsTruncate = preview.length > charLimit;
              const displayText = isExpanded
                ? preview
                : needsTruncate
                ? preview.slice(0, charLimit) + "…"
                : preview;

              return (
                <UpdateCard key={m.id}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 }, scrollSnapAlign: "start" }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {m.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflow: isExpanded ? "visible" : "hidden",
                        mb: 2,
                        lineHeight: 1.5,
                      }}
                      onClick={() => needsTruncate && toggleExpanded(m.id)}
                    >
                      {displayText}
                    </Typography>
                    {needsTruncate && (
                      <CtaButton
                        color="tertiary"
                        size="small"
                        onClick={() => toggleExpanded(m.id)}
                      >
                        {isExpanded ? "קרא פחות" : "קרא עוד"}
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
                  </CardContent>
                </UpdateCard>
              );
            })}
          </Box>

          <IconButton
            onClick={() => scroll(scrollAmount)}
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translate(50%, -50%)",
              zIndex: 2,
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
