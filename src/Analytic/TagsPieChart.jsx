// src/components/TagsPieChart.jsx
import React, { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';

/**
 * TagsPieChart
 *
 * Props:
 * - activities: Array<{
 *     tag: string,
 *     registrations: number,
 *   }>
 */
export default function TagsPieChart({ activities }) {
  // aggregate registrations and count per tag
  const { data, totalNorm } = useMemo(() => {
    const map = {};
    activities.forEach(({ tag, registrations }) => {
      if (!map[tag]) map[tag] = { registrations: 0, count: 0 };
      map[tag].registrations += registrations;
      map[tag].count += 1;
    });

    // compute normalized values and total
    let total = 0;
    const items = Object.entries(map).map(([tag, { registrations, count }]) => {
      const norm = registrations / count;
      total += norm;
      return { tag, registrations, norm };
    });

    // prepare pie data
    const pieData = items.map(({ tag, registrations, norm }) => ({
      id: tag,
      label: tag,
      value: norm,
      registrations,
    }));

    return { data: pieData, totalNorm: total };
  }, [activities]);

  return (
    <div style={{ height: 360 }}>
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        innerRadius={0} // עוגה מלאה
        padAngle={0.5} // מרווחים עדינים
        cornerRadius={3}
        colors={{ scheme: 'category10' }} // צבעים חזקים
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        enableArcLabels={false} // לא להציג טקסט בפנים
        enableSlicesLabels={true} // כן להציג תוויות בחוץ
        sliceLabel={d => `${d.label} ${((d.value / totalNorm) * 100).toFixed(1)}%`}
        tooltip={({ datum }) => (
          <div style={{ padding: '6px 8px', background: '#fff', border: '1px solid #ccc' }}>
            <strong>{datum.id}</strong><br />
            {datum.data.registrations.toLocaleString()} הרשמות<br />
            {((datum.value / totalNorm) * 100).toFixed(1)}%
          </div>
        )}
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            translateX: 140,
            itemWidth: 100,
            itemHeight: 18,
            symbolSize: 12,
            symbolShape: 'circle',
          }
        ]}
      />
    </div>
  );
}
