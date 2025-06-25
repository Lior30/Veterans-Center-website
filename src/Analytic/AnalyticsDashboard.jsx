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

/* dashboard */
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

  
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  
  const thisWeekEnd = new Date(now);

  
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
            : 100  
    );
  });

  return () => unsubscribe();
}, []);



  useEffect(() => {
  (async () => {
    const snap = await getDocs(collection(db, 'activities'));

    /*RAW activities*/
    const raw = snap.docs.map(d => ({
      id: d.id,        
      ...d.data()
    }));
    setAllActivities(raw);                     

    /* Tag statistics  */
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

           
    setUsersBreakdown([
      { id: 'משתמשים רשומים', value: registered, color: '#7e64e0' },
      { id: 'חברי מרכז 60+',   value: senior,     color: ' #ffe87e' }
    ]);
  })();
}, []);

  useEffect(() => {
    
    if (!allActivities.length) return;

    (async () => {
    const surveysSnap   = await getDocs(collection(db, 'surveys'));
    let totalAnswered   = 0;
    let totalRegistered = 0;
    const detailsArr    = [];

      for (const surveyDoc of surveysSnap.docs) {
        const surveyData   = surveyDoc.data();
        const activityId   = surveyData.of_activity;
        if (!activityId) continue;

        
        const answersSnap   = await getDocs(
          collection(db, 'surveys', surveyDoc.id, 'responses')
        );
        const answeredCount = answersSnap.size;

        
        const act = allActivities.find(a => a.id === activityId);
        if (!act) continue;

        const registeredCount = Array.isArray(act.participants)
          ? act.participants.length
          : 0;

        totalAnswered   += answeredCount;
        totalRegistered += registeredCount;

        detailsArr.push({
          id            : surveyDoc.id,
          name          : surveyData.headline,
          activityName  : act.name   || '',
          registered    : registeredCount,
          answered      : answeredCount,
          notAnswered   : registeredCount - answeredCount
        });
      }

      setSurveyDetails(detailsArr);
      setSurveyBreakdown([
        { id: 'ענו',     value: totalAnswered,               color: '#7e64e0' },
        { id: 'לא ענו', value: Math.max(totalRegistered - totalAnswered, 0),       color: '#3de1da' }
      ]);
    })();
  }, [allActivities]);



  useEffect(() => {
  
  (async () => {
    const snap = await getDocs(collection(db, 'users'));
    const raw   = snap.docs.map(d => d.data().address || 'לא ידוע');

    
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
    { name: 'בית הכרם',  count: 42, coords: [31.789, 35.183] },
    { name: 'גבעת רם',    count: 18, coords: [31.781, 35.205] },
    { name: 'מנחם בגין',  count: 27, coords: [31.775, 35.195] }
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
          Website and Social Media Analytics
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
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: '#495057',
          marginBottom: 16, textAlign: 'center'
        }}>
           הרשמות לפי תגיות בחודש האחרון
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

        {/*KPI 2*/}
      <div
      style={{
        gridColumn: 2,                 // הטור המרכזי
        gridRow   : '1 / span 2',      // שורה 1 וגם 2
        display   : 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/*KPI*/}
      
     <div style={{ display: 'flex', gap: 16 }}>
    <div style={{ flex: 1 }}>
      <DailyVisitsCard  count={dailyVisitors} />
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
          title="היענות לסקרים"
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
          <JerusalemMap locations={locations}/>
        </div>

        {/* rest of the stuff*/}
        {/* Activities Table */}
        <div
        style={{
          ...cardStyle,
          gridColumn: '2 / span 2',
          gridRow:    2,          
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

          {/* table size */}
          <div style={{ width:'100%', overflowX:'auto', flex:1 }}>
            <ActivitiesTable />
          </div>
        </div>


        {/* Line Chart – registrations by hour/day */}
        <div style={{ ...cardStyle, gridColumn: 1, gridRow: 1  }}>
          <h3 /* … */> הרשמות לפי שעה ויום בחודש האחרון</h3>
          <RegistrationsLineChart activities={allActivities} />
        </div>
      </div>
    </div>
  );
}