// src/components/SurveySection.jsx
import PollIcon from "@mui/icons-material/Poll";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CtaButton from "./CtaButton";
import SectionTitle from "./SectionTitle";

/* survey card */
const SurveyCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  background: "linear-gradient(135deg,#ffffff 0%,#f6f4ff 100%)",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 3px 10px rgba(0,0,0,.08)",
  transition: "transform .25s, box-shadow .25s",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 24px rgba(0,0,0,.15)",
  },
  /* decorative line*/
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 5,
    borderRadius: 4,
    background: theme.palette.primary.main,
    opacity: 0.9,
  },
}));

/* surveys componnents */
export default function SurveySection({
  surveys,
  userProfile,
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
      sx={{
        py: { xs: 4, sm: 6 },
        background: "linear-gradient(180deg,#f7f3ff 0%,#efe7ff 100%)",
      }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<PollIcon />} title="סקרים פתוחים" />

        <Grid container spacing={4}>
          {displayed.map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.id}>
              <SurveyCard>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ color: theme.palette.primary.dark }}
                    noWrap
                  >
                    {s.headline}
                  </Typography>

                  {justIdentified && (
                    <CtaButton color="primary" onClick={() => onFillSurvey(s)}>
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
            <CtaButton color="primary" onClick={onViewAllSurveys}>
              לכל הסקרים
            </CtaButton>
          </Box>
        )}
      </Container>
    </Box>
  );
}
