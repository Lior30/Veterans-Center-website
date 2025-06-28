//HomepageImagesContainer.jsx 
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

  const [message, setMessage] = useState({ open: false, text: '', type: 'success', title: '' });
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

          <Dialog
            open={message.open}
            onClose={(e, reason) => {
              if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                setMessage(prev => ({ ...prev, open: false }));
              }
            }}
            maxWidth="sm"
            sx={{ zIndex: 10000 }}
            slotProps={{
              sx: {
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                border: theme =>
                  `3px solid ${
                    message.type === 'success'
                      ? theme.palette.primary.main
                      : theme.palette.error.main
                  }`,
                boxShadow: 4,
                backgroundColor: '#f9f9f9',
                zIndex: 10000
              }
            }}
          >
            <DialogContent>
              <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
              {message.type === 'success' ? (
                <CheckCircle
                  sx={{
                    fontSize: 72,
                    color: 'primary.main',
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              ) : (
                <Error
                  sx={{
                    fontSize: 72,
                    color: 'error.main',
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              )}
            </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: message.type === 'success' ? 'primary.main' : 'error.main',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {message.text}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                onClick={() => setMessage(prev => ({ ...prev, open: false }))}
                variant="contained"
                size="large"
                sx={{
                  fontSize: '1.3rem',
                  py: 1.5,
                  px: 6,
                  bgcolor:
                    message.type === 'success' ? 'primary.main' : 'error.main',
                  color: 'common.white',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor:
                      message.type === 'success' ? 'primary.dark' : 'error.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                הבנתי
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              אישור מחיקה
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" align="center">
                האם אתה בטוח שברצונך למחוק את התמונה  "{bannerToDelete?.title}"?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button onClick={() => setConfirmOpen(false)} variant="outlined">
                ביטול
              </Button>
              <Button
                onClick={confirmDelete}
                variant="contained"
                color="error"
              >
                מחק
              </Button>
            </DialogActions>
          </Dialog>
    </Box>
  );
}
