// src/components/AnalyticsDashboard.jsx
import React, {  useEffect,useState } from 'react';
import { ResponsivePie }   from '@nivo/pie';
import { ResponsiveBar }   from '@nivo/bar';
import { ResponsiveLine }  from '@nivo/line';
import TagsPieChart        from './TagsPieChart';
import { collection,getDocs, getDoc, doc,  onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from '../firebase'; 
import ActivitiesTable from './ActivitiesTable';
import JerusalemMap from './JerusalemMap';
import RegistrationsLineChart from './RegistrationsLineChart';
import DonutChart              from './DonutChart'; 
import DailyVisitsCard  from './DailyVisitorsCard';
import WeeklyVisitsCard from './WeeklyVisitsCard';
import { Link } from 'react-router-dom';

/* ───────────────────────────── דשבורד ───────────────────────────── */
export default function AnalyticsDashboard() {
  const [locations, setLocations] = useState([]); 
  const [allActivities, setAllActivities] = useState([]);
  const [dailyVisitors , setDailyVisitors ] = useState(0);
  const [weeklyVisitors, setWeeklyVisitors] = useState(0);
  const [changePercent , setChangePercent ] = useState(0);
  const [usersBreakdown , setUsersBreakdown ] = useState([]);
  const [surveyBreakdown, setSurveyBreakdown] = useState([]);
  const [tagStats,    setTagStats]    = useState([]); 
  const [surveyDetails,   setSurveyDetails]   = useState([]); 

useEffect(() => {
  const now = new Date();

  // מתי השבוע התחיל (שבת בחצות)
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // מתי שבוע שעבר התחיל
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  // מתי השבוע הזה עד עכשיו (עד היום והשעה הנוכחיים)
  const thisWeekEnd = new Date(now);

  // מתי שבוע שעבר עד אותו זמן
  const lastWeekEnd = new Date(prevWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + now.getDay());
  lastWeekEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());


  const q = query(
    collection(db, "visits"),
    orderBy("timestamp", "desc")
  );
  const unsubscribe = onSnapshot(q, snap => {
    let todayCount    = 0;
    let thisWeekCount = 0;
    let lastWeekCount = 0;

    snap.forEach(doc => {
      const ts = doc.data().timestamp.toDate();

       if (ts >= todayStart && ts <= now) {
        todayCount++;
      }

      if (ts >= weekStart && ts <= thisWeekEnd) {
        thisWeekCount++;
      }

      if (ts >= prevWeekStart && ts <= lastWeekEnd) {
        lastWeekCount++;
      }
    });
    setDailyVisitors  (todayCount);
    setWeeklyVisitors(thisWeekCount);
    setChangePercent(
      lastWeekCount
            ? Math.round((thisWeekCount - lastWeekCount) / lastWeekCount * 100)
            : 100  // אם שבוע שעבר היה 0, אז הכל זה גידול של 100%
    );
  });

  return () => unsubscribe();
}, []);



  useEffect(() => {
  (async () => {
    const snap = await getDocs(collection(db, 'activities'));

    /* ---- RAW activities (כפי שהן) ---- */
    const raw = snap.docs.map(d => d.data());
    setAllActivities(raw);                     // <-- חדש

    /* ---- Tag statistics ---- */
    const rows = raw.flatMap(d => {
      const participants = Array.isArray(d.participants)
        ? d.participants.length
        : 0;
      const capacity = d.capacity ?? 0;

      return (d.tags ?? []).map(tag => ({
        tag,
        participants,
        capacity,
      }));
    });
    setTagStats(rows);
  })();
}, []);



  useEffect(() => {
  (async () => {
    const snap = await getDocs(collection(db, 'users'));
    let registered = 0, senior = 0;

    snap.forEach(d => {
      const u = d.data();
      if (u.is_registered) registered += 1;
      if (u.is_club_60)    senior     += 1;
    });

           // משתמשים – סגול (#7e64e0) מול צהוב (#ffd400)
    setUsersBreakdown([
      { id: 'משתמשים רשומים', value: registered, color: '#7e64e0' },
      { id: 'חברי מרכז 60+',   value: senior,     color: ' #ffe87e' }
    ]);
  })();
}, []);

  useEffect(() => {
    (async () => {
      // 1. שליפת כל הסקרים
      const surveysSnap = await getDocs(collection(db, 'surveys'));
      const detailsArr = [];
      let totalAnswered = 0;
      let totalCapacity = 0;

      for (const surveyDoc of surveysSnap.docs) {
        const surveyData = surveyDoc.data();
        const activityId = surveyData.of_activity;
        if (!activityId) continue;

        // 2. ספירת תשובות מתוך תת-קולקשן "responses"
        const answersSnap = await getDocs(
          collection(db, 'surveys', surveyDoc.id, 'responses')
        );
        const answeredCount = answersSnap.size;

        // 3. קבלת המכסה (capacity) של הפעילות
        const actDoc = await getDoc(doc(db, 'activities', activityId));
        const capacity = actDoc.exists()
          ? actDoc.data().capacity || 0
          : 0;

        detailsArr.push({
          title:      surveyData.headline,
          registered: capacity,
          answered:   answeredCount
        });

        totalAnswered += answeredCount;
        totalCapacity += capacity;
      }

      // 4. עדכון ה-state של הפרטים ושל הדונאט
      setSurveyDetails(detailsArr);
      setSurveyBreakdown([
        { id: 'ענו',     value: totalAnswered,               color: '#7e64e0' },
        { id: 'לא ענו', value: totalCapacity - totalAnswered, color: '#3de1da' }
      ]);
    })();
  }, []);


  useEffect(() => {
  (async () => {
    const snap = await getDocs(collection(db, 'activities'));

    /* ---- RAW activities (כפי שהן) ---- */
    const raw = snap.docs.map(d => d.data());
    setAllActivities(raw);                     // <-- חדש

    /* ---- Tag statistics ---- */
    const rows = raw.flatMap(d => {
      const participants = Array.isArray(d.participants)
        ? d.participants.length
        : 0;
      const capacity = d.capacity ?? 0;

      return (d.tags ?? []).map(tag => ({
        tag,
        participants,
        capacity,
      }));
    });
    setTagStats(rows);
  })();
}, []);



  useEffect(() => {
  /* ➊ שליפת כל המשתמשים */
  (async () => {
    const snap = await getDocs(collection(db, 'users'));
    const raw   = snap.docs.map(d => d.data().address || 'לא ידוע');

    /* ➋ ספירת מופעים לפי כתובת */
    const freq = {};
    raw.forEach(addr => { freq[addr] = (freq[addr] || 0) + 1; });

    /* ➌ Geocoding – כתובת → קואורדינטה
          (שימוש ב-Nominatim OpenStreetMap)             */
    const geocode = async address => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Jerusalem, Israel')}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.length) {
        return [parseFloat(json[0].lat), parseFloat(json[0].lon)];
      }
      return null;   // אם לא נמצא
    };

    /* ➍ מקבילים את כל הבקשות */
    const entries = await Promise.all(
      Object.entries(freq).map(async ([name, count]) => {
        const coords = await geocode(name);
        return coords ? { name, count, coords } : null;
      })
    );

    const filtered = entries.filter(Boolean);

    /* ➎ חישוב אחוז מכלל-המשתמשים */
    const total = raw.length || 1;
    const withPct = filtered.map(l => ({
      ...l,
      percent: l.count / total
    }));

    setLocations(withPct);
  })();
}, []);



  /* סגנון כרטיס בסיסי */
  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    height: 'fit-content'
  };

  const sampleLocations = [
    { name: 'בית הכרם',  count: 42, coords: [31.789, 35.183] },
    { name: 'גבעת רם',    count: 18, coords: [31.781, 35.205] },
    { name: 'מנחם בגין',  count: 27, coords: [31.775, 35.195] }
  ];

  /* ───────────────────────────── JSX ───────────────────────────── */
  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* ==== Header ==== */}
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
          Website and Social Media Analytics
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        </div>
      </div>

      {/* ==== Main Grid (שורה עליונה) ==== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr', // Pie | KPIs | Map
        gridTemplateRows: 'auto auto 1fr',
        gridAutoRows: 'auto',
        gap: '20px'
      }}>
       
       {/* ── Pie Chart – רשומות לפי תגית ── */}
      <div style={{ ...cardStyle, gridColumn: 3, gridRow: 1 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: '#495057',
          marginBottom: 16, textAlign: 'center'
        }}>
          הרשמות לפי תגית
        </h3>
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

        <TagsPieChart activities={tagStats} />
      </div>

        {/* ── שני KPI (אמצע) ── */}
      <div
      style={{
        gridColumn: 2,                 // הטור המרכזי
        gridRow   : '1 / span 2',      // שורה 1 וגם 2
        display   : 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* === שורת KPI-ים (לצד זה) === */}
      
      <div style={{ display: 'flex', gap: 16 }}>
        <DailyVisitsCard  count={dailyVisitors} />
        <WeeklyVisitsCard count={weeklyVisitors}
                          deltaPct={changePercent} />
      </div>

          {/* דונאט: סוגי משתמשים */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,200px)',  // 2 עמודות קבועות
              gap: 40,
              justifyContent: 'right',                // יישור אופקי
              marginTop: 8 
            }}
          >
            <DonutChart
              title="סוגי משתמשים"
              data={usersBreakdown}
              size={180}
              colors={['#7e64e0', '#ffe87e']}
            />

          {/* דונאט: היענות לסקרים */}
          <div style={{ position: 'relative' }}>
            <DonutChart
              title="היענות לסקרים"
              data={surveyBreakdown}
              size={180}
              colors={['#7e64e0', '#3de1da']}
            />

           {/* <Link to="/survey-details" state={{ surveyDetails }}>
            <button
              style={{
                padding: '4px 6px',
                fontSize: '12px',
                border: 'none',
                background: '#7e64e0',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ←
            </button>
          </Link> */}

            </div>
        </div>
        </div>




        {/* ── Map (ימין, משתרע לשתי שורות) ── */}
       <div style={{ ...cardStyle, gridArea: '2 / 1 / 4 / 2' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '16px',
            textAlign: 'center',
            direction: 'ltr'
          }}>
            פיזור גאוגרפי של המשתמשים
          </h3>
          <JerusalemMap locations={locations} />
        </div>

        {/* ─────────────────────── שאר הווידג׳טים מתחת ─────────────────────── */}
        {/* Activities Table (כרטיס אחד בלבד בתוך ה-grid) */}
        <div
        style={{
          ...cardStyle,
          gridColumn: '2 / span 2',
          gridRow:    2,          /* שורה שנייה */
          display: 'flex',
          flexDirection: 'column'
        }}
        >
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#495057',
            margin: '0 0 16px',
            textAlign: 'center',
            direction: 'ltr'
          }}>
              פעילויות עם ביקוש נמוך בשבוע הקרוב
          </h3>

          {/* הטבלה –  תתפוס את כל הגובה שנותר  */}
          <div style={{ width:'100%', overflowX:'auto', flex:1 }}>
            <ActivitiesTable />
          </div>
        </div>


        {/* Line Chart – registrations by hour/day */}
        <div style={{ ...cardStyle, gridColumn: 1, gridRow: 1  }}>
          <h3 /* … */>הרשמות לפי שעה ויום</h3>
          <RegistrationsLineChart activities={allActivities} />
        </div>
      </div>
    </div>
  );
}