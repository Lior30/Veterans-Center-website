import React from 'react';

/**
 * WeeklyVisitsCard
 * -----------------
 * This component displays the number of visits in the last week
 *
 * @prop {number} count    
 * @prop {number} deltaPct 
 */
export default function WeeklyVisitsCard({ count = 0, deltaPct = null }) {
  const hasDelta = Number.isFinite(deltaPct);
    const cappedPct = hasDelta ? Math.max(-100, deltaPct) : null;

  const isUp  = cappedPct !== null && cappedPct >= 0;
  const arrow = cappedPct === null ? ''        : isUp ? '▲' : '▼';
  const color = cappedPct === null ? '#6c757d' : isUp ? '#28a745' : '#dc3545';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        textAlign: 'center',
        padding: '28px 40px',
        width: '100%',
        minHeight: 120
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: '#212529',
          lineHeight: 1
        }}
      >
        {count.toLocaleString()}
      </div>

      <div style={{ marginTop: 8, fontSize: 14, color: '#6c757d' }}>
        כניסות&nbsp;בשבוע&nbsp;האחרון
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 14,
          color,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          alignItems: 'center'
        }}
      >
         {cappedPct === null
          ? '—'
          : <>
      <span>
        {cappedPct >= 0 ? '▲' : '▼'}
        {Math.abs(cappedPct).toFixed(0)}%
        {cappedPct >= 0 ? '+' : '-'}

      </span>
            </>
        }
        <span style={{ color: '#6c757d' }}>
          &nbsp;משבוע&nbsp;שעבר
        </span>
      </div>
    </div>
  );
}