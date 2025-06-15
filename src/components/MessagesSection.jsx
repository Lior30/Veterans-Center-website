// src/components/MessagesSection.jsx
import React from "react";
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
  overflow: "hidden",
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
  onReadMore,
  justIdentified,
}) {
  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, backgroundColor: "#f9f9f9" }}>
      <Container maxWidth="lg">
        <SectionTitle icon={<ArticleIcon />} title="הודעות אחרונות" />

        <Grid container spacing={4}>
          {messages.slice(0, 3).map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.id}>
              <UpdateCard>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {m.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {m.body?.slice(0, 100) + "..."}
                  </Typography>
                  {justIdentified && (
                    <CtaButton color="primary" onClick={() => onReadMore(m.id)}>
                      השב
                    </CtaButton>
                  )}
                </CardContent>
              </UpdateCard>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={4}>
          <CtaButton color="secondary" onClick={() => onReadMore(null)}>
            לכל ההודעות
          </CtaButton>
        </Box>
      </Container>
    </Box>
  );
}
