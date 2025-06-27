// src/components/FlyersSection.jsx
// Responsive‑only tweaks – no logic changes
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

/* dd\MM\yyyy */
const formatDateNumeric = (isoDate) => {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
return `${day}/${month}/${year}`;

};

/* ARROWS */

const ArrowBtn = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  width: 40,
  height: 40,
  borderRadius: "50%",
  color: "#fff",
  background: "linear-gradient(135deg,#8e24aa 0%,#6a1b9a 100%)",
  boxShadow: "0 3px 10px rgba(106,27,154,.4)",
  "&:hover": { background: "linear-gradient(135deg,#7b1fa2 0%,#4a148c 100%)" },
  "&::before": {               
    content: "none",
  },
  "&.slick-disabled": {        // when disabled 
    opacity: 0,
    pointerEvents: "none",
  },
  [theme.breakpoints.down("sm")]: {
    width: 34,
    height: 34,
    boxShadow: "0 2px 6px rgba(106,27,154,.35)",
  },
}));

/* ARROWS LEFT&RIGHT*/
const PrevArrow = ({ className, style, onClick }) => (
  <ArrowBtn className={className} style={style} onClick={onClick} sx={{ left: -22 }}>
    <ArrowBackIosNewIcon fontSize="small" />
  </ArrowBtn>
);

const NextArrow = ({ className, style, onClick }) => (
  <ArrowBtn className={className} style={style} onClick={onClick} sx={{ right: -22 }}>
    <ArrowForwardIosIcon fontSize="small" />
  </ArrowBtn>
);

/* CARD */
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
  const md = theme.breakpoints.values.md;
  const sm = theme.breakpoints.values.sm;

  const settings = {
    rtl: true,
    infinite: flyers.length > 4,
    slidesToShow: 5,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: md, settings: { slidesToShow: 3 } },
      { breakpoint: sm, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box component="section" sx={{ background: `linear-gradient(180deg, ${theme.palette.primary.vlight} 0%, #ffffff 100%)`,

 }}>
      <Container maxWidth="lg" sx={{  }}>
        {/* TITLE */}

        <Box sx={{ position: "relative", mt: 2 }}>
          <Slider {...settings}>
            {flyers.map((f) => (
              <Box key={f.id} sx={{ px: 3 }}>
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
                        [theme.breakpoints.down("sm")]: {
                          aspectRatio: "3.5/6.5",
                        },
                      }}
                    />
                    <CardContent sx={{ p: { xs: 1.25, sm: 2 }, textAlign: "center" }}>
                      <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
  <Typography
    variant="subtitle2"
    fontWeight={600}
    noWrap
    sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
  >
    {activities.find((a) => a.id === f.activityId)?.name || f.name}
  </Typography>

  {/* icon for 60+*/}
  {activities.find((a) => a.id === f.activityId)?.registrationCondition === "member60" && (
    <Box
      component="img"
      src="/assets/Club60.png"
      alt="מועדון 60+"
      sx={{
        width: 30,
        height: 30,
      }}
    />
  )}
</Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                      >
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
