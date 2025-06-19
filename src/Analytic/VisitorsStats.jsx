// src/components/VisitorsStats.jsx
import React from 'react';

/**
 * VisitorsStats:
 * Shows total weekly visitors and percentage change.
 *
 * Props:
 * - weeklyVisitors: number
 * - changePercent: number (positive = up, negative = down)
 */
export default function VisitorsStats({ weeklyVisitors, changePercent }) {
  const isUp = changePercent >= 0;
  const arrow = isUp ? '▲' : '▼';
  const color = isUp ? '#28a745' : '#dc3545';

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 8,
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      textAlign: 'center',
      maxWidth: 300,
      margin: '0 auto'
    }}>
      {/* המספר הגדול */}
      <div style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#312783'
      }}>
        {weeklyVisitors.toLocaleString()}
      </div>

      {/* כותרת משנה */}
      <div style={{
        fontSize: '1rem',
        color: '#666666',
        margin: '8px 0'
      }}>
        Visitors Past Week
      </div>

      {/* אחוז שינוי עם חץ */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '1rem',
        color
      }}>
        <span style={{ marginRight: 4 }}>{arrow}</span>
        <span style={{ marginRight: 8 }}>
          {Math.abs(changePercent)}%
        </span>
        <span style={{ color: '#666666' }}>
          Weekly Change
        </span>
      </div>
    </div>
  );
}