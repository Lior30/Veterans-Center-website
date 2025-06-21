// src/components/AnalyticsDashboard.jsx
import React, {  useEffect,useState } from 'react';
import { ResponsivePie }   from '@nivo/pie';
import { ResponsiveBar }   from '@nivo/bar';
import { ResponsiveLine }  from '@nivo/line';
import TagsPieChart        from './TagsPieChart';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 
import ActivitiesTable from './ActivitiesTable';
import JerusalemMap from './JerusalemMap';
import RegistrationsLineChart from './RegistrationsLineChart';
import DonutChart              from './DonutChart'; 

/* ───────────────────────────── דשבורד ───────────────────────────── */
export default function AnalyticsDashboard() {
  const [tagStats, setTagStats] = useState([]);
  const [locations, setLocations] = useState([]); 
  const [allActivities, setAllActivities] = useState([]);

  // ▸ טבעת ❶   משתמשים: רשומים / 60+
  const [usersBreakdown, setUsersBreakdown] = useState([
    { id: 'משתמשים רשומים', value: 0 },
    { id: 'חברי מרכז 60+',  value: 0 }
  ]);

  // ▸ טבעת ❷   סקרים: ענו / לא ענו
  const [surveyBreakdown, setSurveyBreakdown] = useState([
    { id: 'ענו',    value: 0 },
    { id: 'לא ענו', value: 0 }
  ]);

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
      { id: 'חברי מרכז 60+',   value: senior,     color: '#ffd400' }
    ]);
  })();
}, []);

useEffect(() => {
  (async () => {
    // 1. כל הפעילויות: participants לפי id
    const actSnap = await getDocs(collection(db, 'activities'));
    const participantsByAct = {};
    actSnap.forEach(doc => {
      const d = doc.data();
      const n = Array.isArray(d.participants) ? d.participants.length : 0;
      participantsByAct[doc.id] = n;
    });

    // 2. כל תשובות הסקרים
    const ansSnap = await getDocs(collection(db, 'surveyResponses'));
    const answeredByAct = {};
    ansSnap.forEach(doc => {
      const { activityId } = doc.data();
      if (!activityId) return;
      answeredByAct[activityId] = (answeredByAct[activityId] || 0) + 1;
    });

    // 3. סכימה גלובלית
    let answered = 0, could = 0;
    Object.entries(participantsByAct).forEach(([id, p]) => {
      answered += answeredByAct[id] || 0;
      could    += p;
    });

    // סקרים – סגול (#7e64e0) מול תכלת-בהיר (#20bdff)
    setSurveyBreakdown([
      { id: 'ענו',    value: answered,            color: '#7e64e0' },
      { id: 'לא ענו', value: Math.max(could-answered,0), color: '#3de2da' }
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


useEffect(() => {
  (async () => {
    const snap = await getDocs(collection(db, 'activities'));

    const rows = snap.docs.flatMap(doc => {
      const d = doc.data();
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

  /* ─────── נתונים לדוגמה ─────── */
  const [metrics] = useState({
    weeklyVisitors: 1031,
    totalConverted: 30,
    changePercent: 13
  });
  const osData = [
    { Macintosh: [
        { id: 'Display',  value: 45 },
        { id: 'Email',    value: 11 },
        { id: 'Facebook', value: 11 },
        { id: 'Organic',  value: 27 },
        { id: 'Search',   value: 6  }
      ]},
    { Windows: [
        { id: 'Display',  value: 46 },
        { id: 'Email',    value: 7  },
        { id: 'Facebook', value: 5  },
        { id: 'Organic',  value: 27 },
        { id: 'Search',   value: 15 }
      ]},
    { Linux: [
        { id: 'Display',  value: 41 },
        { id: 'Email',    value: 12 },
        { id: 'Facebook', value: 7  },
        { id: 'Organic',  value: 34 },
        { id: 'Search',   value: 6  }
      ]}
  ];

  const barData = [
    { hour: '0',  '1 Lifetime Purchase': 5,  '2': 8,  '3 or 4': 12, '5 to 10 Above': 3  },
    { hour: '2',  '1 Lifetime Purchase': 7,  '2': 12, '3 or 4': 15, '5 to 10 Above': 5  },
    { hour: '4',  '1 Lifetime Purchase': 10, '2': 18, '3 or 4': 22, '5 to 10 Above': 8  },
    { hour: '6',  '1 Lifetime Purchase': 15, '2': 25, '3 or 4': 30, '5 to 10 Above': 12 },
    { hour: '8',  '1 Lifetime Purchase': 20, '2': 32, '3 or 4': 38, '5 to 10 Above': 15 },
    { hour: '10', '1 Lifetime Purchase': 25, '2': 40, '3 or 4': 45, '5 to 10 Above': 20 },
    { hour: '12', '1 Lifetime Purchase': 30, '2': 45, '3 or 4': 50, '5 to 10 Above': 25 },
    { hour: '14', '1 Lifetime Purchase': 28, '2': 42, '3 or 4': 48, '5 to 10 Above': 22 },
    { hour: '16', '1 Lifetime Purchase': 32, '2': 48, '3 or 4': 52, '5 to 10 Above': 28 },
    { hour: '18', '1 Lifetime Purchase': 35, '2': 50, '3 or 4': 55, '5 to 10 Above': 30 },
    { hour: '20', '1 Lifetime Purchase': 30, '2': 45, '3 or 4': 50, '5 to 10 Above': 25 },
    { hour: '22', '1 Lifetime Purchase': 20, '2': 35, '3 or 4': 40, '5 to 10 Above': 18 }
  ];

  const lineData = [
    {
      id: 'Brand A',
      data: [
        { x: 'Jan', y: 10 }, { x: 'Feb', y: 15 }, { x: 'Mar', y: 13 },
        { x: 'Apr', y: 18 }, { x: 'May', y: 22 }, { x: 'Jun', y: 20 },
        { x: 'Jul', y: 25 }, { x: 'Aug', y: 28 }, { x: 'Sep', y: 30 }
      ]
    },
    {
      id: 'Brand B',
      data: [
        { x: 'Jan', y: 8 }, { x: 'Feb', y: 12 }, { x: 'Mar', y: 10 },
        { x: 'Apr', y: 16 }, { x: 'May', y: 14 }, { x: 'Jun', y: 18 },
        { x: 'Jul', y: 15 }, { x: 'Aug', y: 20 }, { x: 'Sep', y: 17 }
      ]
    }
  ];

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

        <TagsPieChart activities={tagStats} />
      </div>

        {/* ── שני KPI (אמצע) ── */}
        <div
          style={{
            gridColumn: 2,   // עדיין הטור האמצעי
            gridRow:    1,   // עדיין השורה העליונה
            flexDirection: 'column',// ← שורות אנכיות
            gap: 16
          }}
        >
          {/* Total Converted */}
           <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ ...cardStyle, flex: 1, minHeight: 110 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '34px',
                fontWeight: '700',
                color: '#212529',
                lineHeight: '1'
              }}>
                {metrics.totalConverted.toLocaleString()}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6c757d',
                marginTop: '4px',
                marginBottom: '8px'
              }}>
                כניסות היום
              </div>
            </div>
          </div>

          {/* Weekly Visitors */}
          <div style={{ ...cardStyle, flex: 1, minHeight: 110 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '34px',
                fontWeight: '700',
                color: '#212529',
                lineHeight: '1'
              }}>
                {metrics.weeklyVisitors.toLocaleString()}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6c757d',
                marginTop: '4px',
                marginBottom: '8px'
              }}>
                כניסות בשבוע האחרון
              </div>
              <div style={{
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span style={{ color: '#6c757d' }}>משבוע שעבר: </span>
                <span style={{ color: '#28a745' }}>▲ {metrics.changePercent}%</span>
              </div>
            </div>
          </div>
          </div>

          {/* דונאט: סוגי משתמשים */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 140px)',  // 2 עמודות קבועות
              gap: 100,
              justifyContent: 'center',                // יישור אופקי
              marginTop: 40 
            }}
          >
            <DonutChart
              title="סוגי משתמשים"
              data={usersBreakdown}
              size={180}
              colors={['#7e64e0', '#ffe87e']}
            />

          {/* דונאט: היענות לסקרים */}
            <DonutChart
              title="היענות לסקרים"
              data={surveyBreakdown}
              size={180}
              colors={['#7e64e0', '#3de1da']}
            />
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


