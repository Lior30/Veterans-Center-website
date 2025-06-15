// src/components/FlyersCarousel.jsx
import React from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  styled,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import CtaButton from "./CtaButton";
import SectionTitle from "./SectionTitle";

const FlyerCard = styled(Card)(({ theme }) => ({
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

export default function FlyersCarousel({ flyers, activities, onRegister }) {
  return (
    <Box
      component="section"
      sx={{ py: { xs: 6, sm: 8 }, backgroundColor: theme => theme.palette.background.default }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="הפליירים שלנו" />

        <Grid container spacing={6}>
          {flyers.slice(0, 3).map((flyer) => {
            const activity =
              activities.find((a) => a.id === flyer.activityId) || {};
            return (
              <Grid item xs={12} sm={6} md={6} key={flyer.activityId}>
                <FlyerCard>
                  <CardMedia
                    component="img"
                    image={flyer.fileUrl}
                    alt={activity.name}
                    sx={{
                      height: 260,
                      objectFit: "cover",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom noWrap>
                      {activity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.date
                        ? new Date(activity.date).toLocaleDateString("he-IL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <CtaButton
                        color="primary"
                        startIcon={<EventIcon />}
                        onClick={() => onRegister(activity.id)}
                      >
                        הרשמה מהירה
                      </CtaButton>
                    </Box>
                  </CardContent>
                </FlyerCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
