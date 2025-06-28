//HomepageImagesContainer.jsx 
import React, { useState, useEffect, useRef } from "react";
import HomepageImagesDesign from "./HomepageImagesDesign.jsx";
import ActionFeedbackDialog from "./ActionFeedbackDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import BannerService from "../services/BannerService.js";
import {
  Container,
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";


export default function HomepageImagesContainer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [banners, setBanners] = useState([]);
  const dragIndexRef = useRef(null);

  const [message, setMessage] = useState({ open: false, text: '', type: 'success'});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);


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

  /* upload/delete */
  const reload = () => load();

  const handleDelete = (banner) => {
    setBannerToDelete(banner);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      await BannerService.deleteBanner(bannerToDelete);
      setBannerToDelete(null);
      setConfirmOpen(false);
      load();
      setMessage({ open: true, type: "success", text: "התמונה נמחקה בהצלחה" });
    } catch (err) {
      setMessage({ open: true, type: "error", text: "שגיאה במחיקת התמונה" });
    }
  };



  const handleOrderChange = async (id, newOrder) => {
  const curr = banners.find((b) => b.id === id);
  const other = banners.find((b) => b.order === newOrder);

  if (!curr || !other || curr.id === other.id) return;

  try {
    await BannerService.updateBanner(curr.id, { order: newOrder });
    await BannerService.updateBanner(other.id, { order: curr.order });

    // Update local state (optional: for speed before reload)
    setBanners((prev) =>
      prev.map((b) =>
        b.id === curr.id
          ? { ...b, order: newOrder }
          : b.id === other.id
          ? { ...b, order: curr.order }
          : b
      )
    );
  } catch (err) {
    alert("שגיאה בשמירת הסדר: " + err.code);
    load();
  }
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
            onOrderChange={handleOrderChange}
            setMessage={setMessage}
          />
        </Stack>
      </Container>

      <ActionFeedbackDialog
        open={message.open}
        type={message.type}
        text={message.text}
        onClose={() => setMessage(prev => ({ ...prev, open: false }))}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="אישור מחיקה"
        text={`האם אתה בטוח שברצונך למחוק את התמונה "${bannerToDelete?.title}"?`}
      />
    </Box>
  );
}
