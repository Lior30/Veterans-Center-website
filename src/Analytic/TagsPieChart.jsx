// src/components/TagsPieChart.jsx
import React, { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import TagsDetailsPage from './TagsDetailsPage';

/*Base colors (up to 10)  */
const BASE_COLORS = [
  '#7e64e0', // purple
  '#3de2da', // turquoise
  '#ffe87e', // pastel yellow
  '#ff9d02', // orange
  '#00b7ff', // light blue
  '#d7c4ff', // light purple
  '#4e2fa7', // dark purple
  '#8c564b', // reddish brown
  '#e377c2', // pink
  '#17becf'  // teal blue
];

/* Generator for extra colors dissimilar to BASE_COLORS  */
function createColorPicker(base = BASE_COLORS) {
  const usedHue = base.map(hexToHue);

  return function pick() {
    let h = 0;
    let tries = 0;
    do {
      h = Math.floor(Math.random() * 360);
      tries++;
    } while (usedHue.some(u => Math.abs(u - h) < 25) && tries < 50);

    usedHue.push(h);
    return `hsl(${h} 70% 55%)`;
  };
}

/* Hex → Hue (0-360) */
function hexToHue(hex) {
  const [r, g, b] = [1, 3, 5].map(i =>
    parseInt(hex.slice(i, i + 2), 16) / 255
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;

  const d = max - min;
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0)
      : max === g ? (b - r) / d + 2
        : (r - g) / d + 4;

  return h * 60;
}

/* Pie chart component */
export default function TagsPieChart({ activities = [] }) {

  /* Create color picker once, not on every render */
  const pickExtraColor = useMemo(
    () => createColorPicker(BASE_COLORS),
    []
  );

  /* Data processing */
  const pieData = useMemo(() => {
    const agg = {};
    activities.forEach(({ tag, participants = 0, capacity = 0 }) => {
      if (!capacity) return;                // skip corrupt rows
      if (!agg[tag]) agg[tag] = { used: 0, cap: 0 };
      agg[tag].used += participants;
      agg[tag].cap += capacity;
    });

    // demandIndex = Σparticipants / Σcapacity  (0–1)
    const demand = Object.fromEntries(
      Object.entries(agg).map(([tag, v]) => [tag, v.used / v.cap])
    );
    const sum = Object.values(demand).reduce((s, v) => s + v, 0) || 1;

    return Object.entries(demand)
      .sort((a, b) => b[1] - a[1])        // high → low
      .map(([tag, idx], i) => {
        const pct = (idx / sum) * 100;
        return {
          id: tag,
          label: tag,
          value: pct,                       // keeps Nivo happy (used for angles)
          pct: pct.toFixed(1),            // string: '14.3'
          participants: agg[tag].used,      /* optional, est. scale */
          color: BASE_COLORS[i] ?? pickExtraColor()
        };
      });
  }, [activities, pickExtraColor]);


  const EMPTY = pieData.length === 0;

  return (
    <div
      style={{
        height: 300,                           
        display: 'flex',
        columnGap: EMPTY ? 0 : 24,               
        direction: 'ltr',
        alignItems: EMPTY ? 'center' : 'stretch',
        justifyContent: EMPTY ? 'center' : 'flex-start'
      }}
    >
      {EMPTY ? (
        <p style={{
          margin: 0,
          fontSize: 16,
          color: '#888',
          direction: 'rtl',
          textAlign: 'center'
        }}>
          אין נתונים להצגה
        </p>
      ) : (
        <>
          {/* Pie chart */}
          <div style={{ flex: 1 }}>
            <ResponsivePie
              data={pieData}
              colors={d => d.data.color}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              innerRadius={0}
              padAngle={0.5}
              cornerRadius={3}
              enableArcLabels={false}
              enableSliceLabels={false}
              enableArcLinkLabels={false}
              animate={false}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              tooltip={({ datum }) => (
                <div style={{ padding: 8, direction: 'rtl' }}>
                  <strong>{datum.id}</strong><br />
                  {datum.data.pct}%&nbsp;|&nbsp;{datum.data.participants} משתתפים
                </div>
              )}
            />
          </div>

          {/* Legend */}
          <div
            style={{
              width: 140,
              maxHeight: 260,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              paddingInlineEnd: 4,
              paddingTop: 16
            }}
          >
            {pieData.map(item => (
              <div
                key={item.id}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: item.color,
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: '#495057',
                    direction: 'rtl',
                    whiteSpace: 'normal',
                    lineHeight: 1.25
                  }}
                >
                  {item.label}<br />
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}