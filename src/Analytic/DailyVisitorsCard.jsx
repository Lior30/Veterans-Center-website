// src/components/DailyVisitorsCard.jsx
import React from 'react';

/**
 * DailyVisitorsCard:
 * Shows today's visitor count in its own card.
 *
 * Props:
 * - dailyVisitors: number
 */
export default function DailyVisitorsCard({ dailyVisitors }) {
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
      <div style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#312783'
      }}>
        {dailyVisitors.toLocaleString()}
      </div>
      <div style={{
        fontSize: '1rem',
        color: '#666666',
        marginTop: '8px'
      }}>
        Visitors Today
      </div>
    </div>
  );
}
