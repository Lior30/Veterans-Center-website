// src/components/LandingDialogs.jsx
import React from "react";
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
} from "@mui/material";
import SectionTitle from "../LandingPage/SectionTitle";
import ReplyContainer from "../components/ReplyContainer";
import SurveyDetailContainer from "../components/SurveyDetailContainer";
import AdminSignIn from "../components/AdminSignIn";
import IdentifyPage from "../components/IdentificationPage";
import CtaButton from "./CtaButton";
import ActivityService from "../services/ActivityService";
import EventIcon from "@mui/icons-material/Event";

// Override Dialog paper for consistent padding & rounded corners
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
  },
}));

export default function LandingDialogs(props) {
  const {
    infoOpen,
    setInfoOpen,
    cancelDialog,
    setCancelDialog,
    confirmCancelRegistration,
    openMyActivities,
    setOpenMyActivities,
    myActivities,
    dialog,
    openDialog,
    flyers,
    closeDialog,
    messages,
    activities,
    surveys,
    userProfile,
    justIdentified,
    openIdentify,
    setOpenIdentify,
    openAdminSignIn,
    setOpenAdminSignIn,
    handleIdentifySuccess,
  } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      {/* 1. Info */}
      <StyledDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          מידע נוסף
        </DialogTitle>
        <DialogContent>
          <Typography>
            לפרטים נוספים ניתן ליצור קשר במספר:&nbsp;
            <strong>
              <a
                href="tel:0523705021"
                style={{
                  color: theme.palette.secondary.main,
                  textDecoration: "none",
                }}
              >
                052-3705021
              </a>
            </strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <CtaButton color="secondary" onClick={() => setInfoOpen(false)}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 2. Cancel registration */}
      <StyledDialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, activityId: null })}
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          אישור ביטול הרשמה
        </DialogTitle>
        <DialogContent>
          <Typography>האם את/ה בטוח/ה שברצונך לבטל את ההרשמה?</Typography>
        </DialogContent>
        <DialogActions>
          <CtaButton
            color="default"
            onClick={() => setCancelDialog({ open: false, activityId: null })}
          >
            ביטול
          </CtaButton>
          <CtaButton
            color="error"
            variant="contained"
            onClick={confirmCancelRegistration}
          >
            בטל הרשמה
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 3. My activities */}
      <StyledDialog
        open={openMyActivities}
        onClose={() => setOpenMyActivities(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          הפעילויות שלי
        </DialogTitle>
        <DialogContent>
          {myActivities.length === 0 ? (
            <Typography>לא נמצאו פעילויות שאליהן נרשמת.</Typography>
          ) : (
            myActivities.map((a) => (
           <Box
  key={a.id}
  sx={{
    mb: 2,
    p: 2,
    borderRadius: 2,
    boxShadow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex", // שינוי חשוב
    flexDirection: "row", // אופקית
    gap: 2,
  }}
>
  {/* הפלייר מימין */}
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
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  )}

  {/* תוכן הפעילות משמאל */}
  <Box flex="1">
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
    >
      <Typography variant="subtitle1" fontWeight="600">
        {a.name || "ללא שם"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {new Date(a.date).toLocaleDateString("he-IL")}
      </Typography>
    </Box>

    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      <strong>שעה:</strong> {a.time || "לא צוינה"}
      {a.location && (
        <>
          <br />
          <strong>מיקום:</strong> {a.location}
        </>
      )}
    </Typography>

    <Box display="flex" justifyContent="flex-end" mt={1}>
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

            ))
          )}
        </DialogContent>
        <DialogActions>
          <CtaButton color="secondary" onClick={() => setOpenMyActivities(false)}>
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          כל ההודעות
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {messages.map((m) => (
              <Grid item xs={12} key={m.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography fontWeight="600">{m.title}</Typography>
                    <Typography
  variant="body2"
  sx={{
    mt: 1,
    whiteSpace: "pre-wrap",   // שומר רווחים ושורות חדשות
    wordBreak: "break-word",  // שבירת מילים ארוכות במידת הצורך
  }}
>
  {m.body}
</Typography>

                    {justIdentified && (
                      <CtaButton
                        color="primary"
                        size="small"
                        onClick={() => openDialog("message", m.id)}
                      >
                        השב
                      </CtaButton>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CtaButton color="secondary" onClick={closeDialog}>
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          פרטי פעילות
        </DialogTitle>
        <DialogContent>
          {dialog.data ? (
            <>
              <Typography variant="h6" gutterBottom>
                {dialog.data.title}
              </Typography>
              <Typography>
                <strong>תאריך:</strong>{" "}
                {new Date(dialog.data.date).toLocaleDateString("he-IL")}
              </Typography>
              <Typography>
                <strong>שעה:</strong> {dialog.data.time || "לא צוינה"}
              </Typography>
              {dialog.data.location && (
                <Typography>
                  <strong>מיקום:</strong> {dialog.data.location}
                </Typography>
              )}
              {dialog.data.description && (
                <Typography sx={{ mt: 2 }}>{dialog.data.description}</Typography>
              )}
            </>
          ) : (
            <Typography>לא נמצאו פרטים</Typography>
          )}
        </DialogContent>
       <DialogActions>
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

  <CtaButton color="secondary" onClick={closeDialog}>
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          הרשמה לפעילות
        </DialogTitle>
        <DialogContent>
          <Typography>
            {userProfile?.first_name}, האם את/ה בטוח/ה שברצונך להירשם לפעילות{" "}
            <strong>
              {activities.find((a) => a.id === dialog.data)?.name || ""}
            </strong>
            ?
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
                const userActs = await ActivityService.getUserActivities(
                  userProfile.id
                );
                const already = userActs.some((a) => a.id === activityId);
                if (already) {
                  alert("את/ה כבר רשום/ה לפעילות הזו");
                  closeDialog();
                  return;
                }
                await ActivityService.registerUser(activityId, {
                  name: userProfile.name || userProfile.first_name,
                  phone: userProfile.phone,
                });
                alert("נרשמת בהצלחה 🎉");
                closeDialog();
              } catch (err) {
                console.error(err);
                alert("שגיאה בהרשמה, נסה/י שוב");
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
         
        </DialogTitle>
        <DialogContent>
  {!dialog.data?.fromMyActivities && (
    <Box
      display="flex"
      justifyContent="center"
      mb={2}
      sx={{ flexWrap: "wrap", gap: 2 }}
    >
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
    }}
  />
</DialogContent>

        <DialogActions>
          <CtaButton color="secondary" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 8. Message reply */}
      <StyledDialog open={dialog.type === "message"} onClose={closeDialog} fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          השב להודעה
        </DialogTitle>
        <DialogContent>
          <ReplyContainer messageId={dialog.data} onClose={closeDialog} />
        </DialogContent>
        <DialogActions>
          <CtaButton color="secondary" onClick={closeDialog}>
            סגור
          </CtaButton>
        </DialogActions>
      </StyledDialog>

      {/* 9. Survey fill */}
      <StyledDialog open={dialog.type === "survey"} onClose={closeDialog} fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          מילוי סקר
        </DialogTitle>
        <DialogContent>
          <SurveyDetailContainer surveyId={dialog.data} onClose={closeDialog} />
        </DialogContent>
        <DialogActions>
          <CtaButton color="secondary" onClick={closeDialog}>
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          כל הסקרים
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {surveys.map((s) => (
              <Grid item xs={12} key={s.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography fontWeight="600">{s.headline}</Typography>
                    {justIdentified && (
                      <CtaButton
                        color="primary"
                        size="small"
                        onClick={() => openDialog("survey", s.id)}
                      >
                        למילוי
                      </CtaButton>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CtaButton color="secondary" onClick={closeDialog}>
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
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
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
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
    </>
  );
}
