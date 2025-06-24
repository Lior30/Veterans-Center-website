// src/components/HomepageImagesContainer.jsx
import React, { useState, useEffect, useRef } from "react";
import HomepageImagesDesign from "./HomepageImagesDesign.jsx";
import BannerService from "../services/BannerService.js";
import {
  Container,
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export default function HomepageImagesContainer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [banners, setBanners] = useState([]);
  const dragIndexRef = useRef(null);

  /* first load */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const list = await BannerService.getBanners();
    const batchFixes = [];
    list.forEach((b, idx) => {
      const fix = {};
      if (b.order === undefined) fix.order = idx;
      if (b.durationSec === undefined) fix.durationSec = 5;
      if (Object.keys(fix).length) batchFixes.push({ id: b.id, fix });
    });
    await Promise.all(
      batchFixes.map(({ id, fix }) => BannerService.updateBanner(id, fix))
    );
    setBanners(
      list.map((b, i) => ({
        ...b,
        order: b.order ?? i,
        durationSec: b.durationSec ?? 5,
      }))
    );
  };

  /* Drag & Drop */
  const handleDragStart = (_, idx) => {
    dragIndexRef.current = idx;
  };
  const handleDragEnter = async (_, idx) => {
    const dragIdx = dragIndexRef.current;
    if (dragIdx === null || dragIdx === idx) return;

    setBanners((prev) => {
      const next = [...prev];
      [next[dragIdx], next[idx]] = [next[idx], next[dragIdx]];
      return next.map((b, i) => ({ ...b, order: i }));
    });

    try {
      await BannerService.swapOrder(
        { id: banners[dragIdx].id, order: idx },
        { id: banners[idx].id, order: dragIdx }
      );
      dragIndexRef.current = idx;
    } catch (err) {
      alert("שמירת הסדר נכשלה: " + err.code);
      load();
    }
  };

  /* change */
  const handleDurationChange = (id, val) =>
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, durationSec: val } : b))
    );

  const handleDurationBlur = async (id, val) => {
    try {
      await BannerService.updateBanner(id, { durationSec: val });
    } catch (err) {
      alert("השמירה נכשלה: " + err.code);
    }
  };

  /* upload/delete */
  const reload = () => load();
  const handleDelete = async (banner) => {
    if (!window.confirm(`למחוק את "${banner.title}"?`)) return;
    await BannerService.deleteBanner(banner);
    load();
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* headline*/}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          sx={{
            mb: 4,
            fontWeight: 700,
            color: theme.palette.primary.main,
            position: "relative",
            "&::after": {
              content: '""',
              width: 60,
              height: 4,
              bgcolor: theme.palette.primary.main,
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: 2,
            },
          }}
        >
          ניהול תמונות אווירה
        </Typography>

        {/* list design*/}
        <Stack spacing={4}>
          <HomepageImagesDesign
            banners={banners}
            onUpload={reload}
            onDelete={handleDelete}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDurationChange={handleDurationChange}
            onDurationBlur={handleDurationBlur}
          />
        </Stack>
      </Container>
    </Box>
  );
}
