// src/components/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import JerusalemMap from './JerusalemMap';
import VisitorsStats from './VisitorsStats';
import DailyVisitorsCard from './DailyVisitorsCard';
import TagsPieChart from './TagsPieChart';

// sample data for the map
const sampleLocations = [
  { name: 'בית הכרם', count: 42, coords: [31.789, 35.183] },
  { name: 'גבעת רם',   count: 18, coords: [31.781, 35.205] },
  { name: 'מנחם בגין', count: 27, coords: [31.775, 35.195] },
];

// placeholder style
const placeholderStyle = (w, h) => ({
  width: `${w}px`,
  height: `${h}px`,
  backgroundColor: '#f0f0f0',
  border: '2px dashed #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#999',
  fontSize: '0.9rem',
});


export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingAct]  = useState(true);

    // useEffect(() => {
    //   fetch('/api/analytics/activities')
    //     .then(res => {
    //       if (!res.ok) throw new Error(res.statusText);
    //       return res.json();
    //     })
    //     .then(data => {
    //       console.log('activities from API:', data);   // ⬅️ כאן
    //       setActivities(data);
    //     })
    //     .catch(err => console.error(err))
    //     .finally(() => setLoadingAct(false));
    // }, []);

    useEffect(() => {
      // במקום fetch בזמן שה־API לא עובד
      const fakeData = [
        { tag: 'ספורט', registrations: 15 },
        { tag: 'תרבות', registrations: 10 },
        { tag: 'חברה', registrations: 5 }
      ];
      setActivities(fakeData);
      setLoadingAct(false);
    }, []);

  useEffect(() => {
    // סימולציה של קריאת API
    setTimeout(() => {
      setMetrics({ weeklyVisitors: 7822, changePercent: 13, dailyVisitors: 1123 });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>טוען נתונים…</div>;
  }
  if (!metrics) {
    return <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>אין נתונים</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr 1fr 1fr',
        gridAutoRows:       'auto',
        gap: '16px',
        padding: '24px',
      }}
    >
      {/* מפת ירושלים */}
      <section
        style={{
          gridColumn: '1',
          gridRow:    '1 / span 2',   // מתפרס על שורה 1 ו-2
        }}
      >
        <JerusalemMap locations={sampleLocations} />
      </section>

      {/* כרטיס יומי */}
      <section style={{ gridColumn: '2', gridRow: '1' }}>
        <DailyVisitorsCard dailyVisitors={metrics.dailyVisitors} />
      </section>

      {/* כרטיס שבועי */}
      <section style={{ gridColumn: '3', gridRow: '1' }}>
        <VisitorsStats
          weeklyVisitors={metrics.weeklyVisitors}
          changePercent={metrics.changePercent}
        />
      </section>

      <section style={{ gridColumn: '4', gridRow: '1' }}>
        <h2>עוגת תגיות</h2>
        {loadingActivities ? (
          <div>טוען עוגת תגיות…</div>
        ) : activities.length > 0 ? (
          <TagsPieChart activities={activities} />
        ) : (
          <div>אין נתונים לתצוגת עוגה</div>
        )}
      </section>

      {/* Row 2: טבעת */}
      <section style={{ gridColumn: '1 / span 2', gridRow: '2' }}>
        <h2>טבעת</h2>
        <div style={placeholderStyle(400, 250)}>
          Placeholder for Donut Charts
        </div>
      </section>

      {/* Row 2: גרף עמודות */}
      <section style={{ gridColumn: '3 / span 2', gridRow: '2' }}>
        <h2>גרף עמודות</h2>
        <div style={placeholderStyle(400, 250)}>
          Placeholder for Bar Chart
        </div>
      </section>

      {/* Row 3: טבלה */}
      <section style={{ gridColumn: '1 / span 2', gridRow: '3' }}>
        <h2>טבלה</h2>
        <div style={placeholderStyle(400, 200)}>
          Placeholder for Table
        </div>
      </section>

      {/* Row 3: גרף נקודות */}
      <section style={{ gridColumn: '3 / span 2', gridRow: '3' }}>
        <h2>גרף נקודות</h2>
        <div style={placeholderStyle(400, 200)}>
          Placeholder for Scatter/Line Chart
        </div>
      </section>
    </div>
  );
}
