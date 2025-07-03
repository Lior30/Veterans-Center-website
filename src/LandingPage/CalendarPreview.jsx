// src/components/CalendarPreview.jsx
import heLocale from "@fullcalendar/core/locales/he";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useMemo, useRef, useState } from "react";

import {
  Box,
  Container,
  IconButton,
  styled,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";

import usePublicHolidays from "../hooks/usePublicHolidays";
import SectionTitle from "./SectionTitle";

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
  const calendarRef = useRef(null);

  const [view, setView] = useState("timeGridDay");
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = useMemo(() => {
    return currentDate.toLocaleDateString("he-IL", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const calendarMinWidth = isMobile && view === "timeGridDay" ? "100%" : isMobile ? 650 : "auto";

  const [tag, setTag] = useState("ALL");
  const holidays = usePublicHolidays();

  // build tag list
  const tags = useMemo(() => {
    const s = new Set();
    activities.forEach(a => (a.tags || []).forEach(t => s.add(t)));
    return ["ALL", ...Array.from(s)];
  }, [activities]);

  // build events: activities + holidays
  const events = useMemo(() => {
    const toDateTime = (a) => new Date(`${a.date}T${a.startTime || "23:59"}:00`);

    const actEv = activities

      .filter(a => tag === "ALL" || (a.tags || []).includes(tag))


      .map(a => {
        const isRegistered =
          userProfile?.activities?.includes(a.id) ||
          userProfile?.activities?.includes(a.name);

        const isPast = toDateTime(a) < new Date(); // ✅ בדיקה זהה לזו שבקובץ שלך

        return {
          id: a.id,
          title: a.name,
          start: a.recurring ? undefined : `${a.date}T${a.startTime}`,
          end: a.recurring ? undefined : `${a.date}T${a.endTime}`,
          daysOfWeek: a.recurring ? a.weekdays : undefined,
          startTime: a.recurring ? a.startTime : undefined,
          endTime: a.recurring ? a.endTime : undefined,
          startRecur: a.recurring ? a.date : undefined,
          backgroundColor: isPast
            ? "#e0e0e0" // ✅ אפור לפעילויות שעברו
            : theme.palette.primary.lightblue,
          textColor: "#000",
          extendedProps: {
            activityId: a.id,
            isHoliday: false,
            isRegistered,
            isPast,
          },
        };
      });



    const holEv = holidays.map(h => ({
      id: `hol-${h.date}`,
      title: h.title || h.name,
      start: h.date,
      allDay: true,
      backgroundColor: "#FFFACD", // ← כאן מוגדר צבע הרקע של חג (צהוב בהיר)
      textColor: "#000",          // ← וכאן צבע הטקסט
      extendedProps: {
        holiday: true,
        isHoliday: true
      }
    }));


    return [...actEv, ...holEv];
  }, [activities, holidays, tag, theme.palette, userProfile]);

  // click handler
  const handleEventClick = info => {
    const props = info.event.extendedProps;
    if (props.isHoliday) return;

    if (!userProfile?.phone) {
      setOpenIdentify(true);
      return;
    }

    const activityId = props.activityId;
    const flyer = flyers.find(f => f.activityId === activityId);
    const activity = activities.find(a => a.id === activityId);



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

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 3, // רווח קבוע בין הכפתורים (24px)
            mb: 4,
            background: `linear-gradient(180deg, ${theme.palette.primary.vlight} 0%,#ffffff 100%,)`,

          }}
        >
          <ToggleButton
            title="תצוגה יומית"
            active={view === "timeGridDay"}
            icon={<EventIcon fontSize="large" />}
            label="יומי"
            onClick={() => {
              setView("timeGridDay");
              calendarRef.current.getApi().changeView("timeGridDay");
            }}
          />
          <ToggleButton
            title="תצוגה שבועית"
            active={view === "timeGridWeek"}
            icon={<ViewWeekIcon fontSize="large" />}
            label="שבועי"
            onClick={() => {
              setView("timeGridWeek");
              const api = calendarRef.current.getApi();
              api.changeView("timeGridWeek");
              api.today(); // מחזיר לתאריך של היום
            }}
          />
          <ToggleButton
            title="תצוגה חודשית"
            active={view === "dayGridMonth"}
            icon={<CalendarMonthIcon fontSize="large" />}
            label="חודשי"
            onClick={() => {
              setView("dayGridMonth");
              calendarRef.current.getApi().changeView("dayGridMonth");
            }}
          />
        </Box>


        {/* NAV ARROWS */}
        <NavWrapper>
          <NavArrow side="left" onClick={goNext} />
          <NavArrow side="right" onClick={goPrev} />
        </NavWrapper>
        {view === "dayGridMonth" && (
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: theme.palette.primary.main,
              fontWeight: 700,
              mt: 2,
            }}
          >
            {currentMonth}
          </Typography>
        )}


        {/* TAG FILTER */}
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}>
          <Tabs
            value={tag}
            onChange={(e, newTag) => setTag(newTag)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {tags.map(t => (
              <Tab
                key={t}
                value={t}
                label={t === "ALL" ? "הכל" : t}
                sx={{
                  fontWeight: tag === t ? 600 : 400,
                  color: tag === t ? theme.palette.primary.main : theme.palette.text.primary,
                  minWidth: 90,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* CALENDAR */}
        <Box sx={{ overflowX: isMobile ? "auto" : "visible" }}>
          <Box sx={{
            minWidth: calendarMinWidth,

            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fafafa",

            /* HEADER */
            "& .fc-col-header-cell": {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              fontSize: isMobile ? "0.75em" : "1rem",
            },

            /* TODAY */
            "& .fc-timegrid-col.fc-day-today, & .fc-daygrid-day.fc-day-today": {
              backgroundColor: `${theme.palette.primary.vlight} !important`,
            },

            /* EVENT – WEEK/DAY (timeGrid) */
            "& .fc-timegrid-event-harness": {
              backgroundColor: "transparent !important",
              border: "none !important",
              borderRadius: 0,
              margin: "3px 0",
              height: "auto !important"
            },

            "& .fc-timegrid-event": {
              position: "relative !important",
              zIndex: 5,
              height: "auto !important",
              border: "none !important",
              borderRadius: "8px",
              backgroundColor: theme.palette.primary.lightblue,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: isMobile ? "1px 4px" : "4px 8px",
              boxSizing: "border-box",
              overflow: "visible !important",
              whiteSpace: "normal !important",
              wordBreak: "break-word !important",
            },

            "& .fc-timegrid-event .fc-event-main": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },

            /* EVENT – MONTH (dayGrid) */
            "& .fc-daygrid-event": {
              border: "none !important",
              borderRadius: "8px",
              backgroundColor: theme.palette.primary.lightblue,
              color: "#000",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              overflow: "visible !important",
              whiteSpace: "normal !important",
              wordBreak: "break-word !important",
              margin: "2px 0",
              padding: isMobile ? "1px" : "4px",
              fontSize: isMobile ? "0.7em" : "0.85em",
            },
            "& .fc-daygrid-event-dot": { display: "none" },
            "& .fc-daygrid-event .fc-event-main-frame": {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
          }}>
            <FullCalendar
              datesSet={() => {
                const centerDate = calendarRef.current?.getApi().getDate();
                if (centerDate) {
                  setCurrentDate(centerDate);
                }
              }}
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
              slotEventOverlap={false}
              eventOverlap={false}
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
              slotDuration="01:00:00"
              slotLabelInterval="01:00"
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              displayEventEnd={false}

              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}

              eventClick={handleEventClick}
              eventDidMount={(info) => {
                const { isPast, isRegistered, isHoliday } = info.event.extendedProps;

                // אם זה חג – אל תגעי בכלום
                if (isHoliday) return;

                // צבע רקע
                if (isPast) {
                  info.el.style.backgroundColor = "#e0e0e0"; // אפור
                } else {
                  info.el.style.backgroundColor = theme.palette.primary.lightblue; // תכלת רגיל
                }

                // צבע טקסט אחיד
                info.el.style.color = "#000";

                // מסגרת אם המשתמש רשום
                if (isRegistered && !isPast) {
                  info.el.style.border = "2px solid #81D4FA";
                  info.el.style.borderRadius = "8px";
                }

                // ✔️ לפני כותרת
                const titleEl = info.el.querySelector(".fc-event-title");
                if (titleEl && isRegistered && !titleEl.innerHTML.startsWith("✔️")) {
                  titleEl.innerHTML = `✔️ ${titleEl.innerHTML}`;
                }

                // שינוי גודל טקסט
                const frame = info.el.querySelector(".fc-event-main");
                if (!titleEl || !frame) return;

                let fs = parseFloat(getComputedStyle(titleEl).fontSize);
                const fits = () =>
                  titleEl.scrollHeight <= frame.clientHeight &&
                  titleEl.scrollWidth <= frame.clientWidth;

                while (!fits() && fs > 8) {
                  fs -= 1;
                  titleEl.style.fontSize = `${fs}px`;
                }
              }}

              eventContent={(renderInfo) => {
                const { isRegistered, isPast, isHoliday } = renderInfo.event.extendedProps;
                const startOnly = renderInfo.timeText;

                // אם זה חג – החזר עיצוב שונה
                if (isHoliday) {
                  return (
                    <Box
                      sx={{
                        backgroundColor: "#FFFACD", // צהוב בלבד
                        borderRadius: "8px",
                        padding: "4px",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: isMobile ? "0.7em" : "0.85em",
                          color: "#000",
                        }}
                      >
                        {renderInfo.event.title}
                      </Typography>
                    </Box>
                  );
                }

                // פעילות רגילה
                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                      boxSizing: "border-box",
                      border: isRegistered && !isPast ? "2px solid #81D4FA" : "none",
                      borderRadius: "8px",
                      padding: "4px",
                      backgroundColor: isPast
                        ? "#e0e0e0"
                        : theme.palette.primary.lightblue,
                      backgroundClip: "padding-box",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace: "normal",
                        textAlign: "center",
                        lineHeight: 1.2,
                        fontSize: isMobile ? "0.7em" : "0.85em",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {isRegistered && (
                        <Box component="span" sx={{ color: "#81D4FA" }}>✔️</Box>
                      )}
                      {renderInfo.event.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: isMobile ? "0.6em" : "0.75em" }}
                    >
                      {startOnly}
                    </Typography>
                  </Box>
                );
              }}







            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

/* helpers */

function ToggleButton({ title, icon, label, active, onClick }) {
  const theme = useTheme();

  return (
    <Tooltip title={title}>
      <Box
        onClick={onClick}
        sx={{
          cursor: "pointer",
          width: 90,
          height: 90,
          borderRadius: "16px",
          backgroundColor: active ? theme.palette.primary.light : "#f0f0f0",
          color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
          boxShadow: active ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: active ? theme.palette.primary.main : "#e0e0e0",
          },
        }}
      >
        {icon}
        <Typography
          variant="subtitle1"
          fontWeight={active ? 700 : 400}
          sx={{ mt: 0.5, fontSize: "0.9rem", lineHeight: 1 }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function NavArrow({ side, onClick }) {
  const theme = useTheme();
  const isLeft = side === "left";
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: 0,
        [isLeft ? "left" : "right"]: 0,
        transform: `translate(${isLeft ? "-" : ""}50%, -50%)`,
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        "&:hover": { backgroundColor: theme.palette.primary.dark },
        [theme.breakpoints.down("sm")]: {
          top: "50%",
          transform: `translate(${isLeft ? "-" : ""}50%, -50%)`,
        },
      }}
    >
      {isLeft ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
    </IconButton>
  );
}