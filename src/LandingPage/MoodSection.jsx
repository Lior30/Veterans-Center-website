// src/components/MoodSection.jsx
import { Box, Container, Fade, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import BannerService from "../services/BannerService";

export default function MoodSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);


  useEffect(() => {
    BannerService.getBanners()
      .then((items) => setBanners(items))
      .catch((err) => console.error("Error loading banners:", err));
  }, []);


  useEffect(() => {
    if (!banners.length) return;
    const displayDuration = 5000;    // display every 5 seconds
    const fadeDuration = 800;        // duration of the animation
    let hideTimeout, showTimeout, cycleInterval;

    const cycle = () => {
      // after displayDuration, start hiding
      hideTimeout = setTimeout(() => {
        setVisible(false);
        // after fadeDuration, change image and show
        showTimeout = setTimeout(() => {
          setIndex((i) => (i + 1) % banners.length);
          setVisible(true);
        }, fadeDuration);
      }, displayDuration);
    };

    cycle();
    cycleInterval = setInterval(cycle, displayDuration + fadeDuration * 2);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
      clearInterval(cycleInterval);
    };
  }, [banners]);

  if (!banners.length) return null;
  const current = banners[index];

  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, bgcolor: "#fafafa" }}>
      <Container maxWidth="md" sx={{ position: "relative" }}>

        <Fade in={visible} timeout={800}>
          <Box
            sx={{
              width: "100%",
              height: isMobile ? 200 : 300,
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
              boxShadow: theme.shadows[3],
              backgroundImage: `url(${current.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                bgcolor: "rgba(0,0,0,0.4)",
                color: "#fff",
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography variant={isMobile ? "subtitle2" : "h6"}>
                {current.title}
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
