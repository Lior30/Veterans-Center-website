import React from 'react';

/**
 * WeeklyVisitsCard
 * -----------------
 * מציג את מספר הכניסות בשבוע האחרון + שינוי
 *
 * @prop {number} count    – סך הכניסות בשבוע
 * @prop {number} deltaPct – אחוז שינוי ביחס לשבוע קודם
 */
export default function WeeklyVisitsCard({ count = 0, deltaPct = 0 }) {
  const isUp   = deltaPct >= 0;
  const arrow  = isUp ? '▲' : '▼';
  const color  = isUp ? '#28a745' : '#dc3545';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: 12,
        paddingBlock: 28,
        paddingInline: 40,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        textAlign: 'center',
        minWidth: 180
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
        {arrow} {Math.abs(deltaPct).toFixed(0)}%
        <span style={{ color: '#6c757d' }}>&nbsp;משבוע&nbsp;שעבר</span>
      </div>
    </div>
  );
}
