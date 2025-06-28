// src/components/Analytic/RegistrationsLineChart.jsx
import React, { useMemo, useState } from 'react';
  
import { ResponsiveLine } from '@nivo/line';

/*
 * Line + Points chart – registrations per hour (08-21) per weekday.
 * Props:
 *   activities: [{
 *     date:       'YYYY-MM-DD',
 *     startTime:  'HH:mm',          // 24-hour
 *     participants: [...array]      // array ⇒ length = registrations
 *   }]
 */
export default function RegistrationsLineChart({ activities = [] }) {
  /* ─────────── constants ─────────── */
  const HOURS = [...Array(14).keys()].map(h => h + 8); 
  const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']; 
  
  // State for tooltip
  const [tooltip, setTooltip] = useState(null); 

  /* ─────────── aggregate once ─────────── */
   const { data, maxY } = useMemo(() => {
    /* טבלת 0-ים */
    const table = Array(7).fill(null).map(() =>
      HOURS.reduce((m,h)=>({ ...m, [h]:0 }), {})
    );

    activities.forEach(act => {
      const date =
      act.date            ? new Date(act.date) :
      act.activity_date   ? new Date(act.activity_date) :
                            null;
    if (!date) return;   // skip corrupted rows
      const dayIdx = date.getDay();              
      const hr   = parseInt((act.activity_time || '00').slice(0,2),10);

      if (hr >= 8 && hr <= 21) {
        const cnt =
        act.num_registrants ??
        (Array.isArray(act.participants) ? act.participants.length : 0);
        table[dayIdx][hr] += cnt;
      }
    });

    /* convert to Nivo format */
    const series = table.map((row, i) => ({
      id: WEEKDAYS[i],
      data: HOURS.map(h => ({ x: String(h), y: row[h] }))
    }));

    const max = Math.max(
      ...series.flatMap(s => s.data.map(p => p.y))
    );                                                      

    console.log('table', table);
    console.log(activities);
    return { data: series, maxY: max };  
  }, [activities]);

  /* ----------- empty-state helper ----------- */
  const total = data.reduce(
    (s, serie) => s + serie.data.reduce((t, p) => t + p.y, 0),
    0
  );
  const EMPTY = total === 0;

  /*purple palette (light→dark) */
  const COLORS = [
    '#4e2fa7',  
    '#d7c4ff', 
    '#3de2da', 
    '#00b7ff', 
    '#ffe87e', 
    '#ff9d02', 
    '#8c564b', 
  ];

  // פונקציה לחישוב מיקום הטולטיפ כך שהוא לא יצא מהמסך
  const CustomTooltip = ({ point }) => {
    return null; // לא נציג טולטיפ כאן, נשתמש בטולטיפ מותאם אישית
  };

  /* ---------- render ---------- */
  return (
    <div
      style={{
        height: 320,
        display: 'flex',
        alignItems: EMPTY ? 'center' : 'stretch',
        justifyContent: EMPTY ? 'center' : 'flex-start',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {EMPTY ? (
        <p style={{ margin: 0, fontSize: 16, color: '#888', direction: 'rtl' }}>
          אין עדיין נתוני הרשמה להצגה
        </p>
      ) : (
        <>
          <ResponsiveLine
            data={data}
            colors={COLORS}
            margin={{ top: 30, right: 120, bottom: 60, left: 70 }}
            xScale={{ type: 'point' }}
            yScale={{ type:'linear', stacked:false, min:0, max: Math.ceil(maxY/10)*10 || 10 }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'שעה',
              legendOffset: 32,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'מספר נרשמים',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableGridX={false}
            enableGridY
            enableArea={false}
            useMesh
            tooltip={CustomTooltip}
            onMouseMove={(point, event) => {
              if (point && event) {
                const rect = event.currentTarget.getBoundingClientRect();
                setTooltip({
                  x: event.clientX,
                  y: event.clientY,
                  day: point.serieId,
                  hour: point.data.x,
                  count: point.data.y
                });
              }
            }}
            onMouseLeave={() => {
              setTooltip(null);
            }}
            legends={[
              {
                anchor: 'right',
                direction: 'column',
                translateX: 100,
                itemWidth: 60,
                itemHeight: 16,
                symbolSize: 12
              }
            ]}
          />
          
          {/* Custom tooltip that follows the mouse */}
          {tooltip && (
            <div
              style={{
                position: 'fixed',
                left: tooltip.x,
                top: tooltip.y - 15,
                transform: 'translate(-50%, -100%)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#333',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center',
                direction: 'rtl',
                pointerEvents: 'none',
                zIndex: 10000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px', direction: 'rtl' }}>
                יום {tooltip.day}
              </div>
              <div style={{ marginBottom: '2px' }}>שעה: {tooltip.hour}:00</div>
              <div>נרשמים: {tooltip.count}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}