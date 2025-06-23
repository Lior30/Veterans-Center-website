import React from 'react';

/**
 * DailyVisitsCard
 * ----------------
 * מציג את מספר הכניסות של היום.
 *
 * @prop {number} count – מספר הכניסות היום
 */
export default function DailyVisitsCard({ count = 0 }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        textAlign: 'center',
        padding: '28px 40px',
        paddingBottom: 55,
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

      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          color: '#6c757d'
        }}
      >
        כניסות&nbsp;היום
      </div>
    </div>
  );
}
