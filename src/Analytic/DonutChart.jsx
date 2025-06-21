// src/components/DonutChart.jsx
import React from 'react';
import { ResponsivePie } from '@nivo/pie';

/**
 * DonutChart
 * @param title   כותרת הטבעת
 * @param data    [{ id, value, color }]
 * @param size    קוטר (px)
 */
export default function DonutChart({ title, data, size = 180 }) {
  return (
    <div
      style={{
        background   : '#fff',
        border       : '1px solid #e9ecef',
        borderRadius : 12,
        boxShadow    : '0 2px 12px rgba(0,0,0,.08)',
        padding      : 16,
        width        : size,
        //  title + donut + legend
        height       : size + 90,
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'center'
      }}
    >

      {/* ───────── כותרת ───────── */}
      <div style={{
        fontWeight: 600,
        fontSize  : 16,
        marginBottom: 8,
        textAlign : 'center',
        color     : '#495057'
      }}>
        {title}
      </div>

      {/* ───────── הטבעת ───────── */}
      <div style={{ width: size, height: size }}>
        <ResponsivePie
          data={data}
          colors={d => d.data.color}
          margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
          innerRadius={0.65}
          padAngle={0.7}
          cornerRadius={3}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          animate={false}
        />
      </div>

      {/* ───────── מקרא ───────── */}
      <div style={{
        marginTop : 12,
        display   : 'flex',
        flexDirection: 'column',
        gap       : 4
      }}>
        {data.map(d => (
          <div key={d.id} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{
              width:12, height:12, borderRadius:'50%', background:d.color
            }}/>
            <span style={{ fontSize:13, color:'#495057' }}>{d.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
