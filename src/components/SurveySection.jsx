// src/components/SurveySection.jsx
import React from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PollIcon from "@mui/icons-material/Poll";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";

const SurveyCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[4],
  },
}));

export default function SurveySection({
  surveys,
  justIdentified,
  onFillSurvey,
  onViewAllSurveys,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const displayed = isMobile ? surveys.slice(0, 3) : surveys;

  return (
    <Box
      component="section"
      sx={{ py: { xs: 4, sm: 6 }, backgroundColor: theme.palette.background.default }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<PollIcon />} title="סקרים פתוחים" />

        <Grid container spacing={4}>
          {displayed.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <SurveyCard>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {s.headline}
                  </Typography>
                  {justIdentified && (
                    <CtaButton color="primary" onClick={() => onFillSurvey(s.id)}>
                      למילוי
                    </CtaButton>
                  )}
                </CardContent>
              </SurveyCard>
            </Grid>
          ))}
        </Grid>

        {isMobile && surveys.length > 3 && (
          <Box textAlign="center" mt={4}>
            <CtaButton color="secondary" onClick={onViewAllSurveys}>
              לכל הסקרים
            </CtaButton>
          </Box>
        )}
      </Container>
    </Box>
  );
}
