// src/components/ActivitiesTable.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * ActivitiesTable
 * 
 * שולף מפיירסטור את כל הפעילויות בשבוע הקרוב,
 * חושב יחס הרישום (registered/capacity),
 * ממיין מהיחס הנמוך לגבוה,
 * ומציג בטבלה RTL.
 */
export default function ActivitiesTable() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const CONDITION_LABELS = {
  registeredUser : 'משתמש רשום',
  member60    : 'חבר מרכז 60+',
  ""          : 'פתוח לכולם',
  // הוסף/י כאן מצבים נוספים אם יש
};

  useEffect(() => {
    async function fetchActivities() {
      // date stored as "YYYY-MM-DD" string in Firestore
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
      const snapshot = await getDocs(q);
      console.log('Fetched activities count:', snapshot.size);

      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || '',
          date: d.date,               // string YYYY-MM-DD
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
      setLoading(false);
    }

    fetchActivities().catch(err => {
      console.error('Error fetching activities:', err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 12, textAlign: 'center' }}>טוען פעילויות…</div>;

return (
  /* מעטפת – גובה קבוע + גלילה אנכית + scrollbar מימין */
   <div
    style={{
      maxHeight: 415,          // ← מורידים!
      overflowY: 'auto',
      direction: 'ltr',        // scrollbar לימין
      border: '1px solid #e9ecef',
      borderRadius: 8
    }}
  >
    {/* הטבלה עצמה נשארת RTL כך שהטקסט מיושר כרגיל בעברית */}
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
        direction: 'rtl'       // לשמור יישור עברי לתאים
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
