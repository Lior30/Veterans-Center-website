// src/components/ActivitiesTable.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * ActivitiesTable
 *
 * Fetches upcoming activities within the next 7 days from Firestore,
 * calculates the registration ratio (registered / capacity),
 * sorts from lowest to highest ratio,
 * and displays them in an RTL table.
 */
export default function ActivitiesTable() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const CONDITION_LABELS = {
    registeredUser: 'משתמש רשום',
    member60: 'חבר מרכז 60+',
    "": 'פתוח לכולם',
    
  };

  useEffect(() => {
    async function fetchActivities() {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const fmt = d => d.toISOString().split('T')[0];
      const startStr = fmt(today);
      const endStr = fmt(nextWeek);

      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('date', '>=', startStr),
        where('date', '<=', endStr)
      );

      try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || '',
            date: d.date,
            condition: d.registrationCondition || '',
            capacity: d.capacity || 0,
            registered: Array.isArray(d.registrants) ? d.registrants.length : 0,
          };
        });

        const withRatio = data.map(item => ({
          ...item,
          ratio: item.capacity > 0 ? item.registered / item.capacity : 0,
        }));

        withRatio.sort((a, b) => a.ratio - b.ratio);
        setActivities(withRatio);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  if (loading) {
    return <div style={{ padding: 12, textAlign: 'center' }}>טוען פעילויות…</div>;
  }

  return (
    <div
      style={{
        maxHeight: 415,
        overflowY: 'auto',
        direction: 'ltr',
        border: '1px solid #e9ecef',
        borderRadius: 8
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          direction: 'rtl'
        }}
      >
        <thead>
          <tr>
            {['שם פעילות', 'תאריך', 'תנאי הרשמה', 'כמות מקסימלית', 'נרשמו'].map(h => (
              <th key={h} style={{ padding: 8, background: '#f2dfc5' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activities.map((act, idx) => (
            <tr key={act.id} style={{ background: idx % 2 ? '#fbf9f5' : '#fff' }}>
              <td style={{ padding: 8, textAlign: 'center' }}>{act.name}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{act.date}</td>
              <td>{CONDITION_LABELS[act.condition] ?? act.condition}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{act.capacity}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{act.registered}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
