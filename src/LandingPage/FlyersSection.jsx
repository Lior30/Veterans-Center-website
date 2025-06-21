// src/components/FlyersSection.jsx
import React from "react";
import Slider from "react-slick";
import {
  Box,
  Container,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  useTheme,
  styled,
  IconButton,
} from "@mui/material";
import SectionTitle from "./SectionTitle";
import EventIcon from "@mui/icons-material/Event";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

/* פורמט תאריך dd\MM\yyyy */
const formatDateNumeric = (isoDate) => {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}\\${month}\\${year}`;
};

/* חץ שמאל */
const PrevArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      left: -22,
      transform: "translateY(-50%)",
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: "50%",
      color: "#fff",
      background: "linear-gradient(135deg,#8e24aa 0%,#6a1b9a 100%)",
      boxShadow: "0 3px 10px rgba(106,27,154,.4)",
      "&:hover": { background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)" },
    }}
  >
    <ArrowBackIosNewIcon fontSize="small" />
  </IconButton>
);

/* חץ ימין */
const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      right: -22,
      transform: "translateY(-50%)",
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: "50%",
      color: "#fff",
      background: "linear-gradient(135deg,#8e24aa 0%,#6a1b9a 100%)",
      boxShadow: "0 3px 10px rgba(106,27,154,.4)",
      "&:hover": { background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)" },
    }}
  >
    <ArrowForwardIosIcon fontSize="small" />
  </IconButton>
);

/* כרטיס פלייר עם קו-מתאר וצל בהובר */
const FlyerCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  transition: "transform .25s, box-shadow .25s",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
}));

export default function FlyersSection({ flyers, activities, openDialog }) {
  const theme = useTheme();

  const settings = {
    rtl: true,
    infinite: flyers.length > 4,
    slidesToShow: 5,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: theme.breakpoints.values.md, settings: { slidesToShow: 3 } },
      { breakpoint: theme.breakpoints.values.sm, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box
      component="section"
      sx={{
        background: "linear-gradient(180deg,#f7f3ff 0%,#efe7ff 100%)",
      }}
    >
      <Container maxWidth="lg">

        <Box sx={{ position: "relative", mt: 3 }}>
          <Slider {...settings}>
            {flyers.map((f) => (
              <Box key={f.id} sx={{ px: 1 }}>
                <FlyerCard>
                  <CardActionArea onClick={() => openDialog("flyer", f)}>
                    <CardMedia
                      component="img"
                      image={f.fileUrl}
                      alt={f.name}
                      sx={{
                        width: "100%",
                        aspectRatio: "4.5/8",
                        objectFit: "cover",
                        objectPosition: "top",
                      }}
                    />
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {activities.find((a) => a.id === f.activityId)?.name || f.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {f.activityDate ? formatDateNumeric(f.activityDate) : "ללא תאריך"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </FlyerCard>
              </Box>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
}
