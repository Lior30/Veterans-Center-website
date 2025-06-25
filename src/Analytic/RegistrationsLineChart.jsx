// src/components/Analytic/RegistrationsLineChart.jsx
import React, { useMemo } from 'react';
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

  /* ─────────── aggregate once ─────────── */
   const { data, maxY } = useMemo(() => {
    /* טבלת 0-ים */
    const table = Array(7).fill(null).map(() =>
      HOURS.reduce((m,h)=>({ ...m, [h]:0 }), {})
    );

    activities.forEach(act => {
      const date   = new Date(act.date);
      const dayIdx = date.getDay();              
      const hr     = parseInt((act.startTime || '00').slice(0, 2), 10);

      if (hr >= 8 && hr <= 21) {
        const cnt = Array.isArray(act.participants)
          ? act.participants.length
          : +act.participants || 0;
        table[dayIdx][hr] += cnt;
      }
    });

    /* convert to Nivo format */
    // return table.map((row, i) => ({
    //   id: WEEKDAYS[i],
    //   data: HOURS.map(h => ({ x: h.toString(), y: row[h] }))
    // }));
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



  /*fallback */
  const total = data.reduce(
    (s, serie) => s + serie.data.reduce((t, p) => t + p.y, 0),
    0
  );
  if (total === 0)
    return (
      <p style={{ textAlign: 'center', margin: '2rem 0' }}>
        אין עדיין נתוני הרשמה להצגה
      </p>
    );

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

  /*render */
  return (
    <div style={{ height: 320 }}>
      <ResponsiveLine
        data={data}
        colors={COLORS}
        margin={{ top: 20, right: 100, bottom: 45, left: 50 }}
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
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            translateX: 92,
            itemWidth: 60,
            itemHeight: 16,
            symbolSize: 12
          }
        ]}
      />
    </div>
  );
}