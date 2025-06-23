// src/components/LandingDialogs.jsx
import React, { useState, useEffect } from "react";
import SyncCalendarButton from "../components/SyncCalendarButton";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Grow,
  styled,
  Button,
} from "@mui/material";
import { CheckCircle, Error } from '@mui/icons-material';
import ReplyContainer from "../components/ReplyContainer";
import SurveyDetailContainer from "../components/SurveyDetailContainer";
import AdminSignIn from "../components/AdminSignIn";
import IdentifyPage from "../components/IdentificationPage";
import CtaButton from "./CtaButton";
import EventIcon from "@mui/icons-material/Event";
import ActivityService from "../services/ActivityService";

/* ---------- styled helpers ---------- */
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
    boxShadow: theme.shadows[4],
    maxHeight: "90vh",
    overflowY: "auto",
  },
}));
const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: "box-shadow .3s",
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
  "&:hover": { boxShadow: theme.shadows[3] },
}));
const Label = (props) => (
  <Typography variant="subtitle2" fontWeight={600} sx={{ minWidth: 60 }} {...props} />
);

/* ---------- component ---------- */
export default function LandingDialogs({
  infoOpen,
  setInfoOpen,
  cancelDialog,
  setCancelDialog,
  confirmCancelRegistration,
  openMyActivities,
  setOpenMyActivities,
  dialog,
  openDialog,
  flyers,
  closeDialog,
  messages,
  activities,
  setUserProfile,
  surveys,
  userProfile,
  justIdentified = false,
  openIdentify,
  setOpenIdentify,
  openAdminSignIn,
  setOpenAdminSignIn,
  handleIdentifySuccess,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [message, setMessage] = useState({ open: false, text: '', type: 'success', title: '' });

  /* ---------- helper ---------- */
  const toDateTime = (a) => new Date(`${a.date}T${a.startTime || "23:59"}:00`);

  /* ---------- state – up-to-date list every time dialog opens ---------- */
  const [upcomingActs, setUpcomingActs] = useState([]);

  useEffect(() => {
    if (!openMyActivities) return;

    async function refresh() {
      // אם יש לך קריאת API ייעודית – החלף בשורה הבאה
      // const fresh = await ActivityService.getMyActivities(userProfile.id);

      // ברירת-מחדל: סינון מתוך ‎activities‎ שהגיעו כ-prop
      const fresh = activities.filter(
        (a) =>
          userProfile?.activities?.includes(a.id) ||
          userProfile?.activities?.includes(a.name)
      );
      const future = fresh.filter((a) => toDateTime(a) >= new Date());
      setUpcomingActs(future);
    }

    refresh();
  }, [openMyActivities, activities, userProfile]);

  /* ---------- UI ---------- */
  return (
    <>
      {/* 2. cancel registration */}
      <StyledDialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, activityId: null })}
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          אישור ביטול הרשמה
        </DialogTitle>
        <DialogContent>
          <Typography>האם את/ה בטוח/ה שברצונך לבטל את ההרשמה?</Typography>
        </DialogContent>
        <DialogActions>
          <CtaButton color="default" onClick={() => setCancelDialog({ open: false, activityId: null })}>
            ביטול
          </CtaButton>
          <CtaButton color="error" variant="contained" onClick={confirmCancelRegistration}>
            בטל הרשמה
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 3. my activities */}
      <StyledDialog
        open={openMyActivities}
        onClose={() => setOpenMyActivities(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          הפעילויות שלי
        </DialogTitle>

        <DialogContent>
          {upcomingActs.length > 0 && (
            <SyncCalendarButton
              activities={upcomingActs.map((a) => ({
                id: a.id,
                title: a.name,
                start: new Date(`${a.date}T${a.startTime || "09:00"}:00`).toISOString(),
                notes: a.description || "",
              }))}
            />
          )}

          {upcomingActs.map((a) => {
            const loc = a.location;
            const locationStr =
              typeof loc === "string"
                ? loc
                : loc && typeof loc === "object"
                ? loc.address || `${loc.lat},${loc.lng}`
                : "";

            return (
              <Box
                key={a.id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  backgroundColor:
                    theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
                  display: "flex",
                  gap: 2,
                }}
              >
                {flyers?.some((f) => f.activityId === a.id) && (
                  <Box
                    onClick={() =>
                      openDialog("flyer", {
                        ...flyers.find((f) => f.activityId === a.id),
                        fromMyActivities: true,
                      })
                    }
                    sx={{
                      cursor: "pointer",
                      width: 140,
                      height: 180,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 1,
                      "&:hover": { boxShadow: 3 },
                    }}
                  >
                    <Box
                      component="img"
                      src={flyers.find((f) => f.activityId === a.id)?.fileUrl}
                      alt="פלייר"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                )}

                <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {a.name}
                  </Typography>

                  <Box display="flex" alignItems="baseline" mt={0.5}>
                    <Label>תאריך:</Label>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(a.date).toLocaleDateString("he-IL")}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="baseline" mt={0.5}>
                    <Label>שעה:</Label>
                    <Typography variant="body2" color="text.secondary">
                      {a.startTime || "לא צוינה"}
                    </Typography>
                  </Box>

                  {locationStr && (
                    <Box display="flex" alignItems="baseline" mt={0.5}>
                      <Label>מיקום:</Label>
                      <Typography variant="body2" color="text.secondary">
                        {locationStr}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                    {locationStr && (
                      <CtaButton
                        component="a"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="secondary"
                        size="small"
                      >
                        ניווט
                      </CtaButton>
                    )}
                    <CtaButton
                      color="error"
                      size="small"
                      onClick={() => setCancelDialog({ open: true, activityId: a.id })}
                    >
                      ביטול הרשמה
                    </CtaButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </DialogContent>

        <DialogActions>
          <CtaButton color="primary.light" onClick={() => setOpenMyActivities(false)}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>



      {/* 4. All messages */}
      <StyledDialog
        open={dialog.type === "all-messages"}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          כל ההודעות
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {messages.map((m) => (
              <Grid item xs={12} key={m.id}>
                <InfoCard variant="outlined">
                  <CardContent>
                    <Typography fontWeight={700}>{m.title}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.body}
                    </Typography>

                    {justIdentified && (
                      <Box mt={1}>
                        <CtaButton
                          color="primary"
                          size="small"
                          onClick={() => openDialog("message", m.id)}
                        >
                          השב
                        </CtaButton>
                      </Box>
                    )}
                  </CardContent>
                </InfoCard>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CtaButton color="primary.light" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 5. Activity details */}
      <StyledDialog
        open={dialog.type === "activity-details"}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          פרטי פעילות
        </DialogTitle>
        <DialogContent>
  {dialog.data ? (
    <>
      {/* כותרת הפעילות */}
      <Typography variant="h6" gutterBottom fontWeight={700}>
        {dialog.data.title}
      </Typography>

      {/* תאריך ושעה */}
      <Typography>
        <strong>תאריך:</strong>{" "}
        {new Date(dialog.data.date).toLocaleDateString("he-IL")}
      </Typography>
      <Typography>
        <strong>שעה:</strong>{" "}
        {dialog.data.startTime || "לא צוינה"}{" "}
        {dialog.data.endTime && `– ${dialog.data.endTime}`}
      </Typography>

     
      {/* תגים (אם קיימים) */}
      {dialog.data.tags?.length > 0 && (
        <Typography>
          <strong>קטגוריה:</strong> {dialog.data.tags.join(", ")}
        </Typography>
      )}

    
      {/* תיאור חופשי */}
      {dialog.data.description && (
        <Typography sx={{ mt: 2 }}>{dialog.data.description}</Typography>
      )}
    </>
  ) : (
    <Typography>לא נמצאו פרטים</Typography>
  )}
</DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {userProfile?.phone ? (
            <CtaButton
              color="primary"
              startIcon={<EventIcon />}
              onClick={() => openDialog("register", dialog.data.id)}
            >
              הרשמה מהירה
            </CtaButton>
          ) : (
            <CtaButton
              color="primary"
              startIcon={<EventIcon />}
              onClick={() => {
                closeDialog();
                setOpenIdentify(true);
              }}
            >
              התחברות להרשמה
            </CtaButton>
          )}
          <CtaButton color="primary.light" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

     {/* 6. Register confirmation */}
      <StyledDialog
        open={dialog.type === "register"}
        onClose={closeDialog}
        fullWidth
        maxWidth="xs"
      >
      <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
        הרשמה לפעילות
      </DialogTitle>

      <DialogContent>
        <Typography>
          {userProfile?.first_name}, האם את/ה בטוח/ה שברצונך להירשם לפעילות{" "}
          <strong>{activities.find((a) => a.id === dialog.data)?.name || ""}</strong>?
        </Typography>
      </DialogContent>

  <DialogActions>
    <CtaButton color="default" onClick={closeDialog}>
      לא
    </CtaButton>

    <CtaButton
      color="primary"
onClick={async () => {
  const activityId = dialog.data;

  try {
    const result = await ActivityService.registerUser(activityId, {
      name: userProfile.name || userProfile.first_name,
      phone: userProfile.phone,
    });

    setMessage({
      open: true,
      text: result.message,
      type: result.success ? 'success' : 'error',
      title: result.title || (result.success ? "הרשמה הושלמה" : "שגיאה בהרשמה"),
    });

    if (result.success) {
      setUserProfile((prev) => ({
        ...prev,
        activities: [...(prev.activities || []), activityId],
      }));

      closeDialog();

      if (openMyActivities) {
        setOpenMyActivities(false);
        setTimeout(() => setOpenMyActivities(true), 0);
      }
    }
  } catch (err) {
    console.error(err);

    // ✅ טיפול במשתמש שכבר רשום
    if (err.message === "alreadyRegistered") {
      setMessage({
        open: true,
        text: "את/ה כבר רשום/ה לפעילות זו.",
        type: "success",
        title: "כבר רשום",
      });

      closeDialog();

      if (openMyActivities) {
        setOpenMyActivities(false);
        setTimeout(() => setOpenMyActivities(true), 0);
      }

      return;
    }

    // ❌ שגיאה כללית
    setMessage({
      open: true,
      text: "אירעה שגיאה במהלך ההרשמה. אנא נסה שוב",
      type: "error",
      title: "שגיאה בהרשמה",
    });
  }
}}


    >
      כן, הירשם/י
    </CtaButton>
  </DialogActions>
</StyledDialog>

      {/* 7. Flyer info */}
      <StyledDialog
        open={dialog.type === "flyer"}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Grow}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }} />
        <DialogContent>
          {!dialog.data?.fromMyActivities && (
            <Box
              display="flex"
              justifyContent="center"
              mb={2}
              sx={{ flexWrap: "wrap", gap: 2 }}
            >{dialog.data?.activityId &&
  activities.find((a) => a.id === dialog.data.activityId)?.registrationCondition === "member60" && (
    <Box display="flex" justifyContent="center" mb={2}>
      <Box
        component="img"
        src="/assets/Club60.png"
        alt="מועדון 60+"
        sx={{ width: 36, height: 36 }}
      />
    </Box>
)}

              <CtaButton
                color="primary"
                startIcon={<EventIcon />}
                onClick={() => {
                  const activityId = dialog.data.activityId;
                  if (!activityId) {
                    alert("הפלייר הזה אינו מקושר לפעילות");
                    return;
                  }
                  closeDialog();
                  if (!userProfile?.phone) {
                    setOpenIdentify(true);
                    return;
                  }
                  openDialog("register", activityId);
                }}
              >
                הרשמה מהירה
              </CtaButton>

              <CtaButton
                color="default"
                onClick={() => {
                  const act = activities.find((a) => a.id === dialog.data.activityId);
                  if (act) {
                    closeDialog();
                    openDialog("activity-details", act);
                  } else {
                    alert("לא נמצאה פעילות מתאימה לפלייר זה");
                  }
                }}
              >
                לפרטים מלאים
              </CtaButton>
              
            </Box>
            
          )}


          <Box
            component="img"
            src={dialog.data?.fileUrl}
            alt={dialog.data?.name || "פלייר"}
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          />
        </DialogContent>
        <DialogActions>
          <CtaButton color="primary.light" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 8. Message reply */}
      <StyledDialog open={dialog.type === "message"} onClose={closeDialog} fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          השב להודעה
        </DialogTitle>
        <DialogContent>
          <ReplyContainer messageId={dialog.data} onClose={closeDialog} />
        </DialogContent>
        <DialogActions>
          <CtaButton color="primary.light" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 9. Survey fill */}
      <StyledDialog open={dialog.type === "survey"} onClose={closeDialog} fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          מילוי סקר
        </DialogTitle>
        <DialogContent>
          <SurveyDetailContainer surveyId={dialog.data} onClose={closeDialog} />
        </DialogContent>
        <DialogActions>
          <CtaButton color="primary.light" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 10. All surveys */}
      <StyledDialog
        open={dialog.type === "all-surveys"}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          כל הסקרים
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {surveys.map((s) => (
              <Grid item xs={12} key={s.id}>
                <InfoCard variant="outlined">
                  <CardContent>
                    <Typography fontWeight={700}>{s.headline}</Typography>
                    {justIdentified && (
                      <Box mt={1}>
                        <CtaButton
                          color="primary"
                          size="small"
                          onClick={() => openDialog("survey", s.id)}
                        >
                          למילוי
                        </CtaButton>
                      </Box>
                    )}
                  </CardContent>
                </InfoCard>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CtaButton color="primary.light" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 11. Identify user */}
      <StyledDialog
        open={openIdentify}
        onClose={() => setOpenIdentify(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          הזדהות
        </DialogTitle>
        <DialogContent>
          <IdentifyPage onSuccess={handleIdentifySuccess} />
        </DialogContent>
        <DialogActions>
          <CtaButton color="default" onClick={() => setOpenIdentify(false)}>
            ביטול
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 12. Admin sign-in */}
      <StyledDialog
        open={openAdminSignIn}
        onClose={() => setOpenAdminSignIn(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
          התחברות מנהל
        </DialogTitle>
        <DialogContent>
          <AdminSignIn />
        </DialogContent>
        <DialogActions>
          <CtaButton color="default" onClick={() => setOpenAdminSignIn(false)}>
            ביטול
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      <Dialog
        open={message.open}
        // Only close when user clicks the button
        onClose={(e, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setMessage(prev => ({ ...prev, open: false }));
          }
        }}
        maxWidth="xs"
        PaperProps={{
          sx: {
            p: 2,
            textAlign: 'center',
            borderRadius: 1,
            // Vibrant border using main palette colors
            border: theme => `3px solid ${theme.palette[message.type === 'success' ? 'success' : 'error'].main}`,
            boxShadow: 2
          }
        }}
      >
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            {message.type === 'success' ? (
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
            ) : (
              <Error sx={{ fontSize: 64, color: 'error.main', mb: 1 }} />
            )}
          </Box>
          <Typography
            variant="h5"                // increased heading size
            sx={{
              fontWeight: 600,
              mb: 1,
              color: message.type === 'success' ? 'success.main' : 'error.main'
            }}
          >
            {message.title}
          </Typography>
          <Typography
            variant="body1"             // increased body size
            sx={{
              fontSize: '1.8rem',         // explicitly larger font
              lineHeight: 1.6,
              color: 'text.primary'
            }}
          >
            {message.text}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 1 }}>
          <Button
            onClick={() => setMessage(prev => ({ ...prev, open: false }))}
            variant="contained"
            size="medium"
            sx={{
              fontSize: '1.2rem',          // larger button font
              py: 1,
              px: 4,                       // slightly more horizontal padding
              // Use main colors for strong effect
              bgcolor: message.type === 'success' ? 'success.main' : 'error.main',
              color: 'common.white',
              '&:hover': {
                bgcolor: message.type === 'success' ? 'success.dark' : 'error.dark'
              }
            }}
          >
            הבנתי
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
