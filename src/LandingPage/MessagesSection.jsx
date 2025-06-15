// src/components/MessagesSection.jsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  styled,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";

const UpdateCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "visible",
  backgroundColor: "#fff",
  boxShadow: theme.shadows[1],
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[4],
  },
}));

export default function MessagesSection({
  messages,
  openDialog,      // החלפנו onReadMore ב–openDialog
  justIdentified,
}) {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box
      component="section"
      sx={{ py: { xs: 4, sm: 6 }, backgroundColor: "#f9f9f9" }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<ArticleIcon />} title="הודעות אחרונות" />

        <Grid container spacing={4}>
          {messages.slice(0, 3).map((m) => {
            const isExpanded = !!expanded[m.id];
            const preview = m.body || "";
            const displayText = isExpanded
              ? preview
              : preview.length > 150
              ? preview.slice(0, 150) + "…"
              : preview;

            return (
              <Grid item xs={12} sm={6} md={4} key={m.id}>
                <UpdateCard>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" gutterBottom>
                      {m.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxHeight: isExpanded ? "none" : 120,
                        overflow: isExpanded ? "visible" : "hidden",
                        mb: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {displayText}
                    </Typography>

                    {preview.length > 150 && (
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
              </Grid>
            );
          })}
        </Grid>

        <Box textAlign="center" mt={4}>
          <CtaButton
            color="secondary"
            onClick={() => openDialog("all-messages")}
          >
            לכל ההודעות
          </CtaButton>
        </Box>
      </Container>
    </Box>
  );
}
