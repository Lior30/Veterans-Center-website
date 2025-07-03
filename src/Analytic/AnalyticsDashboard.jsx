// src/components/AnalyticsDashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import TagsPieChart from './TagsPieChart';
import { collection, getDocs, getDoc, doc, onSnapshot, query, orderBy, Timestamp, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import ActivitiesTable from './ActivitiesTable';
import JerusalemMap from './JerusalemMap';
import RegistrationsLineChart from './RegistrationsLineChart';
import DonutChart from './DonutChart';
import DailyVisitsCard from './DailyVisitorsCard';
import WeeklyVisitsCard from './WeeklyVisitsCard';
import { Link } from 'react-router-dom';
import { getDateRange } from '../utils/timeFilters';
import LineTimeFilter from './LineTimeFilter';
import CardTitle from './CardTitle';

/* ------------- helper: build tag stats after date-filter ------------- */
function buildTagStats(acts) {
  return acts.flatMap(a => {
    // prefer explicit field from analytics
    const participants =
      a.num_registrants ??
      (Array.isArray(a.participants) ? a.participants.length : 0);
    // pick real capacity; if missing ► fall back to participants
    const rawCap = a.capacity ?? a.max_participants ?? 0;
    const capacity = rawCap > 0 ? rawCap : participants;

    // no demand & no capacity → irrelevant
    if (!participants && !capacity) return [];

    return (a.tags ?? []).map(tag => ({
      tag,
      participants,
      activity_date: a.activity_date,
      capacity,          // avoid divide-by-zero
      timestamp: a.timestamp
    }));
  });
}


// utils / wherever the helper lives
export function getFilteredActivities(activities, filterOption) {
  const { startDate, endDate } = getDateRange(filterOption);

  return activities.filter(act => {
    /* pick the best available date field */
    let when;

    if (act.activity_date) {
      // 'YYYY-MM-DD'
      when = new Date(act.activity_date);
    } else if (act.timestamp?.toDate) {
      // Firestore Timestamp
      when = act.timestamp.toDate();
    } else if (act.timestamp instanceof Date) {
      // plain JS Date that כבר נשמר במסמך
      when = act.timestamp;
    } else {
      // no usable date → skip the record
      return false;
    }

    return when >= startDate && when <= endDate;
  });
}



/* dashboard */
export default function AnalyticsDashboard() {
  const [locations, setLocations] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [dailyVisitors, setDailyVisitors] = useState(0);
  const [weeklyVisitors, setWeeklyVisitors] = useState(0);
  const [changePercent, setChangePercent] = useState(0);
  const [usersBreakdown, setUsersBreakdown] = useState([]);
  const [surveyBreakdown, setSurveyBreakdown] = useState([]);
  const [tagStats, setTagStats] = useState([]);
  const [surveyDetails, setSurveyDetails] = useState([]);
  const [activities, setActivities] = useState([]);
  const prevQuarter = () => {
    const q = Math.floor(new Date().getMonth() / 3);   // 0-3
    return q === 0 ? 3 : q - 1;
  };

  const [filterLineChart, setFilterLineChart] = useState({
    type: 'quarter',
    quarter: prevQuarter()
  });

  const [filterTagChart, setFilterTagChart] = useState({
    type: 'quarter',
    quarter: prevQuarter()
  });
  // for the tag-pie: just filter the raw tagStats by date range
  const filteredTagStats = useMemo(
    () => getFilteredActivities(tagStats, filterTagChart),
    [tagStats, filterTagChart]
  );

  /* ---------- demand-line stats (busiest / quietest / total) ---------- */
  const lineStats = useMemo(() => {
    const acts = getFilteredActivities(allActivities, filterLineChart);
    if (!acts.length) return null;

    const byDay = {};              // סך-הכול ליום
    const byHour = Array(24).fill(0); // סך-הכול לשעה (0-23)
    let total = 0;

    acts.forEach(a => {
      const cnt = a.participants ?? 0;   // כבר מספר, לא מערך
      total += cnt;

      const when = a.activity_date ? new Date(a.activity_date)
        : a.date ? new Date(a.date)
          : (a.timestamp && a.timestamp.toDate?.())
          || new Date();

      const d = when.getDay();                 // ‎0-6
      byDay[d] = (byDay[d] || 0) + cnt;

      const hr = parseInt((a.activity_time || '00').slice(0, 2), 10);
      if (hr >= 0 && hr < 24) byHour[hr] += cnt;
    });

    const entries = Object.entries(byDay);
    const busiest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const quietest = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
    const maxHour = byHour.indexOf(Math.max(...byHour));
    const HOURS_RANGE = Array.from({ length: 14 }, (_, i) => i + 8); // 8..21
    let minHour = 8, minCnt = byHour[8] ?? 0;
    HOURS_RANGE.forEach(h => {
      const c = byHour[h] ?? 0;
      if (c > 0 && (c < minCnt || minCnt === 0)) {   // הקטן > 0
        minHour = h;
        minCnt = c;
      }
    });
    const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    return {
      total,
      busiest: { day: HEB_DAYS[busiest[0]], count: busiest[1] },
      quietest: { day: HEB_DAYS[quietest[0]], count: quietest[1] },
      busiestHour: { hour: maxHour, count: byHour[maxHour] },
      quietestHour: { hour: minHour, count: minCnt }
    };
  }, [allActivities, filterLineChart]);

  /* ---------- tag-pie stats (most / least popular tag) ---------- */
  const pieStats = useMemo(() => {
    if (!filteredTagStats.length) return null;

    // Σ per-tag → used / cap
    const agg = {};
    filteredTagStats.forEach(r => {
      if (!agg[r.tag]) agg[r.tag] = { used: 0, cap: 0 };
      agg[r.tag].used += r.participants;
      agg[r.tag].cap += r.capacity || r.participants;
    });

    const rows = Object.entries(agg)
      .filter(([, v]) => v.cap > 0)                // drop corrupt / zero-cap
      .map(([tag, v]) => ({ tag, used: v.used, idx: v.used / v.cap }))
      .sort((a, b) => b.idx - a.idx);              // desc by index

    if (!rows.length) return null;
    return { top: rows[0], bottom: rows[rows.length - 1] };
  }, [filteredTagStats]);


  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'activityAnalytics'), snap => {
      const tagsRows = [];
      const actsRows = [];

      snap.forEach(d => {
        const a = d.data();
        const ts = a.timestamp?.toDate?.() ?? new Date(a.activity_date);

        const rawCap = a.capacity ?? a.max_participants ?? 0;
        const finalCap = rawCap > 0 ? rawCap : (a.num_registrants ?? 0);

        const cnt = a.num_registrants ??
          (Array.isArray(a.participants) ? a.participants.length : 0);

        (a.tags ?? []).forEach(t => tagsRows.push({
          tag: t,
          participants: cnt,
          capacity: finalCap,
          activity_date: a.activity_date,
          timestamp: ts
        }));

        actsRows.push({
          date: a.activity_date,
          activity_time: a.activity_time,   // שומרים בשם האחיד
          participants: cnt,               // מספר בפועל, לא מערך
          timestamp: ts
        });
      });

      setAllActivities(actsRows);
      setTagStats(tagsRows);
    });

    return () => unsub();
  }, []);


  /* ---------------- main effect: load + normalise activities ----------- */
  useEffect(() => {
    const fetchActivities = async () => {
      const snap = await getDocs(collection(db, 'activityAnalytics'));
      const now = Timestamp.now();
      const all = [];

      for (const d of snap.docs) {
        const data = d.data();

        // guarantee every activity has a timestamp
        if (!data.timestamp) {
          await updateDoc(doc(db, 'activities', d.id), { timestamp: now });
          data.timestamp = now;
        }
        const cnt = data.num_registrants ??
          (Array.isArray(data.participants) ? data.participants.length : 0);

        all.push({
          id: d.id,
          ...data,
          participants: cnt,
          activity_time: data.activity_time   // לשם אחיד
        });
      }

      setAllActivities(all);                    // raw activities for filters
      setTagStats(buildTagStats(all));          // initial tag stats
    };

    fetchActivities();
  }, []);


  /* -----------------------------------------------------------------------------------------------------------------------*/
  // תיקון בחלק של חישוב האחוזים ב-useEffect:

  useEffect(() => {
    const now = new Date();

    // תחילת היום (00:00)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // תחילת השבוע הנוכחי (ראשון 00:00)
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // שבוע קודם: מגבול של לפני 7 ימים ועד רגע לפני תחילת השבוע הנוכחי
    const prevWeekEnd = new Date(weekStart.getTime() - 1);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekStart.getDate() - 6);
    prevWeekStart.setHours(0, 0, 0, 0);

    // הוספת לוגים לדיבוג
    console.log('Date ranges:', {
      prevWeekStart: prevWeekStart.toLocaleString('he-IL'),
      prevWeekEnd: prevWeekEnd.toLocaleString('he-IL'),
      weekStart: weekStart.toLocaleString('he-IL'),
      now: now.toLocaleString('he-IL')
    });

    const q = query(
      collection(db, 'visits'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, snap => {
      let todayCnt = 0;
      let thisWeekCnt = 0;
      let lastWeekCnt = 0;

      snap.forEach(d => {
        const ts = d.data().timestamp.toDate();

        if (ts >= todayStart && ts <= now) {
          todayCnt++;
        }
        if (ts >= weekStart && ts <= now) {
          thisWeekCnt++;
        }
        if (ts >= prevWeekStart && ts <= prevWeekEnd) {
          lastWeekCnt++;
        }
      });

      // הוספת לוגים לדיבוג
      console.log('Visit counts:', {
        todayCnt,
        thisWeekCnt,
        lastWeekCnt
      });

      // עדכון ה-state
      setDailyVisitors(todayCnt);
      setWeeklyVisitors(thisWeekCnt);

      // חישוב משופר של אחוז השינוי
      let delta = 0;

      if (lastWeekCnt === 0) {
        // אם לא היו ביקורים בשבוע שעבר אבל יש השבוע
        delta = thisWeekCnt > 0 ? 100 : 0;
      } else {
        // חישוב רגיל של אחוז השינוי
        delta = Math.round(((thisWeekCnt - lastWeekCnt) / lastWeekCnt) * 100);
      }

      console.log('Calculated delta:', delta);
      setChangePercent(delta);
    });

    return () => unsubscribe();
  }, []);

  // גם וודאי שהרכיב WeeklyVisitsCard מציג נכון את הערך:
  // אם יש לך גישה לקוד של WeeklyVisitsCard, ודאי שהוא לא מגביל את הערך




  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      let registered = 0, senior = 0;

      snap.forEach(d => {
        const u = d.data();
        if (u.is_registered) registered += 1;
        if (u.is_club_60) senior += 1;
      });


      setUsersBreakdown([
        { id: 'משתמשים רשומים', value: registered, color: '#7e64e0' },
        { id: 'חברי מרכז 60+', value: senior, color: ' #ffe87e' }
      ]);
    })();
  }, []);

  useEffect(() => {

    if (!allActivities.length) return;

    (async () => {
      const surveysSnap = await getDocs(collection(db, 'surveys'));
      let totalAnswered = 0;
      let totalRegistered = 0;
      const detailsArr = [];

      for (const surveyDoc of surveysSnap.docs) {
        const surveyData = surveyDoc.data();

        const expRaw = surveyData.expires_at;
        if (expRaw) {
          const expDate = expRaw.toDate
            ? expRaw.toDate()
            : new Date(expRaw);
          if (expDate < new Date()) continue;
        }
        const activityId = surveyData.of_activity;

        if (!activityId || activityId === 'כללי') continue;

        if (surveyData.expires_at?.toDate &&
          surveyData.expires_at.toDate() <= new Date()) {
          continue;
        }


        const answersSnap = await getDocs(
          collection(db, 'surveys', surveyDoc.id, 'responses')
        );
        const answeredCount = answersSnap.size;


        const act = allActivities.find(a => a.id === activityId);
        if (!act) continue;
        const registeredCount = Number(act.participants) || 0;

        totalAnswered += answeredCount;
        totalRegistered += registeredCount;

        detailsArr.push({
          id: surveyDoc.id,
          name: surveyData.headline,
          activityName: act.name || '',
          registered: registeredCount,
          answered: answeredCount,
          notAnswered: registeredCount - answeredCount
        });
      }

      setSurveyDetails(detailsArr);
      setSurveyBreakdown([
        { id: 'ענו', value: totalAnswered, color: '#7e64e0' },
        { id: 'לא ענו', value: Math.max(totalRegistered - totalAnswered, 0), color: '#3de1da' }
      ]);
    })();
  }, [allActivities]);



  useEffect(() => {

    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      const raw = snap.docs.map(d => d.data().address || 'לא ידוע');


      const freq = {};
      raw.forEach(addr => { freq[addr] = (freq[addr] || 0) + 1; });


      const geocode = async address => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Jerusalem, Israel')}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.length) {
          return [parseFloat(json[0].lat), parseFloat(json[0].lon)];
        }
        return null;
      };


      const entries = await Promise.all(
        Object.entries(freq).map(async ([name, count]) => {
          const coords = await geocode(name);
          return coords ? { name, count, coords } : null;
        })
      );

      const filtered = entries.filter(Boolean);


      const total = raw.length || 1;
      const withPct = filtered.map(l => ({
        ...l,
        percent: l.count / total
      }));

      setLocations(withPct);
    })();
  }, []);



  /* base card stle*/
  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    height: 'fit-content'
  };

  const sampleLocations = [
    { name: 'בית הכרם', count: 42, coords: [31.789, 35.183] },
    { name: 'גבעת רם', count: 18, coords: [31.781, 35.205] },
    { name: 'מנחם בגין', count: 27, coords: [31.775, 35.195] }
  ];

  /*JSX */
  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/*Header*/}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#212529',
          margin: 0
        }}>
          ניתוח נתונים
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        </div>
      </div>

      {/*Main Grid*/}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr', // Pie | KPIs | Map
        gridTemplateRows: 'auto auto 1fr',
        gridAutoRows: 'auto',
        gap: '20px'
      }}>

        {/*Pie Chart*/}
        <div style={{ ...cardStyle, gridColumn: 3, gridRow: 1 }}>
          <CardTitle>הרשמות לפי תגיות </CardTitle>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 12
          }}>
            <Link to="/tags-details" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '6px 12px',
                background: '#7e64e0',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                תצוגת תגיות
              </button>
            </Link>
          </div>
          <LineTimeFilter value={filterTagChart} onChange={setFilterTagChart} hideWeek />
          <TagsPieChart activities={filteredTagStats} />
          {pieStats && (
            <p style={{ marginTop: 8, fontSize: 13, textAlign: 'center', direction: 'rtl' }}>
              התגית&nbsp;המבוקשת&nbsp;ביותר:
              <strong>{pieStats.top.tag}</strong>
              &nbsp;({pieStats.top.used} משתתפים)
              התגית&nbsp;הכי&nbsp;פחות&nbsp;מבוקשת:
              <strong>{pieStats.bottom.tag}</strong>
              &nbsp;({pieStats.bottom.used} משתתפים)
            </p>
          )}
        </div>

        {/*KPI 2*/}
        <div
          style={{
            gridColumn: 2,
            gridRow: '1 / span 2',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/*KPI*/}

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <DailyVisitsCard count={dailyVisitors} />
            </div>
            <div style={{ flex: 1 }}>
              <WeeklyVisitsCard count={weeklyVisitors} deltaPct={changePercent} />
            </div>
          </div>

          {/* users type*/}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,200px)',
              gap: 50,
              justifyContent: 'right',
              marginTop: 8

            }}
          >
            <DonutChart
              title="סוגי משתמשים"
              data={usersBreakdown}
              size={180}
              colors={['#7e64e0', '#ffe87e']}
            />

            {/* answer to survey*/}
            <DonutChart
              title="היענות לסקרים פתוחים"
              data={surveyBreakdown}
              size={180}
              colors={['#7e64e0', '#3de1da']}
            >
              <Link to="/survey-details" state={{ surveyDetails }} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '6px 12px',
                  background: '#7e64e0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  פירוט סקרים
                </button>
              </Link>
            </DonutChart>
          </div>
        </div>

        {/*Map*/}
        <div style={{ ...cardStyle, gridArea: '2 / 1 / 4 / 2' }}>
          <CardTitle>פיזור גאוגרפי של המשתמשים</CardTitle>
          <JerusalemMap locations={locations} />
        </div>

        {/* rest of the stuff*/}
        {/* Activities Table */}
        <div
          style={{
            ...cardStyle,
            gridColumn: '2 / span 2',
            gridRow: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardTitle>פעילויות עם ביקוש נמוך בשבוע הקרוב</CardTitle>

          {/* table size */}
          <div style={{ width: '100%', overflowX: 'auto', flex: 1 }}>
            <ActivitiesTable />
          </div>
        </div>


        {/* Line Chart – registrations by hour/day */}
        <div
          style={{
            ...cardStyle,
            gridColumn: 1,
            gridRow: 1,
            position: 'relative',    // כדי שה-tooltip ידע למקם את עצמו יחסית לדיב
            overflow: 'visible',     // מאפשר לטיפ להיזרח מעבר לגבולות הקליפ
          }}
        >
          <CardTitle>ביקוש לפי יום בשבוע ושעת פעילות</CardTitle>
          <LineTimeFilter value={filterLineChart} onChange={setFilterLineChart} />
          <RegistrationsLineChart activities={getFilteredActivities(allActivities, filterLineChart)} />


          {lineStats && (
            <p style={{ marginTop: 8, fontSize: 13, textAlign: 'center', direction: 'rtl' }}>
              היום&nbsp;העמוס&nbsp;ביותר:&nbsp;
              <strong>{lineStats.busiest.day}</strong>
              &nbsp;·&nbsp;השעה&nbsp;העמוסה&nbsp;ביותר:&nbsp;
              <strong>{String(lineStats.busiestHour.hour).padStart(2, '0')}:00</strong>
              &nbsp;({lineStats.busiestHour.count} נרשמים)<br />

              היום&nbsp;הכי&nbsp;פחות&nbsp;עמוס:&nbsp;
              <strong>{lineStats.quietest.day}</strong>
              &nbsp;·&nbsp;השעה&nbsp;הכי&nbsp;פחות&nbsp;עמוסה:&nbsp;
              {lineStats.quietestHour.count
                ? <>
                  <strong>{String(lineStats.quietestHour.hour).padStart(2, '0')}:00</strong>
                  &nbsp;({lineStats.quietestHour.count} נרשמים)
                </>
                : '—'}
              <br />

              סה״כ&nbsp;נרשמים&nbsp;בטווח:&nbsp;
              <strong>{lineStats.total}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}