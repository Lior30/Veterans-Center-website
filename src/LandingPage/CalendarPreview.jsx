// src/components/CalendarPreview.jsx
import React, { useMemo, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";
import {
  Box,
  Container,
  Stack,
  useMediaQuery,
  useTheme,
  styled,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import SectionTitle from "./SectionTitle";
import usePublicHolidays from "../hooks/usePublicHolidays";
import CtaButton from "./CtaButton";

const NavWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
}));

export default function CalendarPreview({
  openDialog,
  userProfile,
  setOpenIdentify,
  activities,
  flyers,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [view, setView] = useState("timeGridWeek");
  const calendarRef = useRef(null);
  const [tag, setTag] = useState("ALL");
  const holidays = usePublicHolidays();

  // build tag list
  const tags = useMemo(() => {
    const s = new Set();
    activities.forEach((a) => (a.tags || []).forEach((t) => s.add(t)));
    return ["ALL", ...Array.from(s)];
  }, [activities]);

  // build events: activities + holidays
  const events = useMemo(() => {
    const actEv = activities
      .filter((a) => tag === "ALL" || (a.tags || []).includes(tag))
      .map((a) => ({
        id: a.id,
        title: a.name,
        start: a.recurring ? undefined : `${a.date}T${a.startTime}`,
        end: a.recurring ? undefined : `${a.date}T${a.endTime}`,
        daysOfWeek: a.recurring ? a.weekdays : undefined,
        startTime: a.recurring ? a.startTime : undefined,
        endTime: a.recurring ? a.endTime : undefined,
        startRecur: a.recurring ? a.date : undefined,
        backgroundColor: theme.palette.primary.lightblue,
        textColor: "#000",
        extendedProps: { activityId: a.id, isHoliday: false },
      }));

    const holEv = holidays.map((h) => ({
      id: `hol-${h.date}`,
      title: h.title || h.name,
      start: h.date,
      allDay: true,
      backgroundColor: "#FFFACD", // צבע חגים
      textColor: "#000",
      extendedProps: { holiday: true, isHoliday: true },
    }));

    return [...actEv, ...holEv];
  }, [activities, holidays, tag, theme.palette]);

  // handle clicks: holidays are ignored, unknown phone triggers identify, then show flyer or details
  const handleEventClick = (info) => {
    const props = info.event.extendedProps;
    if (props.isHoliday) return;
    if (!userProfile?.phone) {
      setOpenIdentify(true);
      return;
    }
    const activityId = props.activityId;
    const flyer = flyers.find((f) => f.activityId === activityId);
    const activity = activities.find((a) => a.id === activityId);
    if (flyer) openDialog("flyer", flyer);
    else if (activity) openDialog("activity-details", activity);
    else alert("לא נמצאה פעילות תואמת");
  };

  const goPrev = () => calendarRef.current.getApi().prev();
  const goNext = () => calendarRef.current.getApi().next();

  return (
    <Box component="section" sx={{ py: { xs: 4, sm: 6 }, backgroundColor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="לוח פעילויות" />

        {/* שבועי / חודשי */}
        <Stack direction="row" spacing={6} justifyContent="center" sx={{ mb: 4 }}>
          <Tooltip title="תצוגה שבועית">
            <IconButton
              onClick={() => {
                setView("timeGridWeek");
                calendarRef.current.getApi().changeView("timeGridWeek");
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color:
                  view === "timeGridWeek"
                    ? theme.palette.primary.light
                    : theme.palette.text.secondary,
              }}
            >
              <ViewWeekIcon fontSize="large" />
              <Typography
                variant="subtitle1"
                fontWeight={view === "timeGridWeek" ? 700 : 400}
                sx={{ mt: 0.5 }}
              >
                שבועי
              </Typography>
            </IconButton>
          </Tooltip>

          <Tooltip title="תצוגה חודשית">
            <IconButton
              onClick={() => {
                setView("dayGridMonth");
                calendarRef.current.getApi().changeView("dayGridMonth");
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color:
                  view === "dayGridMonth"
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
              }}
            >
              <CalendarMonthIcon fontSize="large" />
              <Typography
                variant="subtitle1"
                fontWeight={view === "dayGridMonth" ? 700 : 400}
                sx={{ mt: 0.5 }}
              >
                חודשי
              </Typography>
            </IconButton>
          </Tooltip>
        </Stack>

        {/* חיצים קודמים/הבא */}
        <NavWrapper>
          <IconButton
            onClick={goNext}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(-50%, -50%)",
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={goPrev}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </NavWrapper>

        {/* סינון תגיות */}
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    mb: 3,
    overflowX: "auto",          // ← מאפשר גלילה אופקית
    scrollbarWidth: "none",     // ← מסתיר סקּרול־בר בפיירפוקס
    "&::-webkit-scrollbar": { display: "none" }, // ← מסתיר בכרום/ספארי
  }}
>
  <Tabs
    value={tag}
    onChange={(e, newTag) => setTag(newTag)}
    variant="scrollable"
    scrollButtons          // ← תמיד מציג חיצים
    allowScrollButtonsMobile   // ← חובה במובייל כדי לא להסתיר
    aria-label="activity tag tabs"
    textColor="primary"
    indicatorColor="primary"
    sx={{ borderBottom: 1, borderColor: "divider" }}
  >
    {tags.map((t) => (
      <Tab
        key={t}
        value={t}
        label={t === "ALL" ? "הכל" : t}
        wrapped         // במידת הצורך יורד לשתי שורות
        sx={{
          fontWeight: tag === t ? 600 : 400,
          color:
            tag === t ? theme.palette.primary.main : theme.palette.text.primary,
          minWidth: 90,           // רוחב־מינימום אחיד
        }}
      />
    ))}
  </Tabs>
</Box>


        {/* הפידג'ט של לוח */}
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fafafa",

            // כותרות ימים
            "& .fc-col-header-cell": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              fontSize: isMobile ? "0.9em" : "1rem",
            },

            // רקע היום הנוכחי
          "& .fc-timegrid-col.fc-day-today, & .fc-daygrid-day.fc-day-today": {
backgroundColor: theme.palette.primary.vlight + " !important",},

            "& .fc-col-header-cell.fc-day-today": {
              color: "#000",
            },

            // אירועים בשבועי/דיילי
            "& .fc-event": {
              height: "auto !important",
              minHeight: "auto !important",
              overflow: "visible !important",
              whiteSpace: "normal !important",
              wordBreak: "break-word !important",
            },
            "& .fc-event-main": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "4px" : "6px 8px",
            },

            // MONTHLY EVENT STYLING
            "& .fc-daygrid-event": {
              borderRadius: "8px",
              color: "#fff !important",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              overflow: "visible !important",
              whiteSpace: "normal !important",
              wordBreak: "break-word !important",
              margin: "2px 0",
              padding: isMobile ? "2px" : "4px",
            },
            "& .fc-daygrid-event-dot": {
              display: "none",
            },
            "& .fc-daygrid-event .fc-event-main-frame": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
        <FullCalendar
  ref={calendarRef}
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView={view}
  locale={heLocale}
  height="auto"
  nowIndicator
  allDaySlot={false}
  events={events}
  headerToolbar={false}
  selectable={false}
  editable={false}
  eventClick={handleEventClick}
  eventDisplay="block"
  slotMinTime="08:00:00"
  slotMaxTime="22:00:00"
  slotDuration="01:00:00"
  slotLabelInterval="01:00"
  eventTimeFormat={{
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }}
  slotLabelFormat={{
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }}

  
  eventDidMount={info => {
    const titleEl = info.el.querySelector('.fc-event-title');
    if (titleEl && titleEl.scrollHeight > titleEl.clientHeight) {
      titleEl.style.fontSize = '0.7em';
      titleEl.style.lineHeight = '1.1';
    }
  }}
            
            eventContent={(renderInfo) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >

              <Typography
  className="fc-event-custom-title"
  variant="body2"
  sx={{
    fontWeight: 600,
    whiteSpace: "normal",
    textAlign: "center",
    lineHeight: 1.2,
  }}
>
  {renderInfo.event.title}
</Typography>


                <Typography variant="caption">{renderInfo.timeText}</Typography>
              </Box>
            )}
          />
        </Box>
      </Container>
    </Box>
  );
}
