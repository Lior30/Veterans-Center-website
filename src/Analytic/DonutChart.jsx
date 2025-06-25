// src/components/DonutChart.jsx
import React, { memo } from 'react';
import { ResponsivePie } from '@nivo/pie';

/**
 * DonutChart – simple and fast
 * @param title   The title of the chart
 * @param data    [{ id, value, color }]
 * @param size    Diameter (in px)
 */
const DonutChart = memo(function DonutChart({ title, data, size = 200, children }) {
  // If no data – show placeholder immediately
  const displayData = data && data.length > 0 ? data : [
    { id: 'Loading...', value: 100, color: '#e9ecef' }
  ];

  return (
    <div
      style={{
        background   : '#fff',
        border       : '1px solid #e9ecef',
        borderRadius : 12,
        boxShadow    : '0 2px 12px rgba(0,0,0,.08)',
        padding      : 20,
        width        : 220,
        height       : size + 90,
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'right'
      }}
    >

      {/* ───────── Title ───────── */}
      <div style={{
        fontWeight: 600,
        fontSize  : 16,
        marginBottom: 8,
        textAlign : 'right',
        color     : '#495057'
      }}>
        {title}
      </div>

      {/* ───────── Donut Chart ───────── */}
      <div style={{ width: size, height: size }}>
        <ResponsivePie
          data={displayData}
          colors={d => d.data.color}
          margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
          innerRadius={0.65}
          padAngle={0.7}
          cornerRadius={3}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          borderWidth={0}
          animate={false}
          isInteractive={false}
          layers={['arcs']}
          renderWrapper={false}
        />
      </div>

      {/* ───────── Legend and optional button in one row ───────── */}
      <div style={{
        marginTop: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>

        {/* Legend on the right side */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          {displayData.map((d, index) => (
            <div key={`${d.id}-${index}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6 
            }}>
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: d.color
              }}/>
              <span style={{ fontSize: 13, color: '#495057' }}>{d.id}</span>
            </div>
          ))}
        </div>

        {/* Optional button (children) on the left side */}
        {children && (
          <div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
});

export default DonutChart;
