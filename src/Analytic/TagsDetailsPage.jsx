// src/components/TagsDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs }       from 'firebase/firestore';
import { db }                        from '../firebase';
import DonutChart                    from './DonutChart';
import { Link }                      from 'react-router-dom';

export default function TagsDetailsPage() {
  const [byTag, setByTag]         = useState({}); // { tag: [activities...] }
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'activities'));
      const grouped = {};
      snap.forEach(doc => {
        const d = doc.data();
        (d.tags || []).forEach(tag => {
          if (!grouped[tag]) grouped[tag] = [];
          grouped[tag].push({
            id: doc.id,
            title: d.title || d.name || doc.id,
            participants: Array.isArray(d.participants) ? d.participants.length : 0,
            capacity: d.capacity ?? 0
          });
        });
      });
      setByTag(grouped);

      // בחר כברירת מחדל את התגית הראשונה (אם קיימת)
      const first = Object.keys(grouped)[0];
      if (first) setActiveTag(first);
    })();
  }, []);

  // כל התגיות ומערך הפעילויות עבור הטאב הנבחר
  const tags       = Object.keys(byTag);
  const activities = activeTag ? byTag[activeTag] : [];

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <Link
        to="/Data-analysis"
        style={{
          display: 'inline-block',
          marginBottom: 16,
          textDecoration: 'none',
          color: '#7e64e0'
        }}
      >
        ← חזרה לדשבורד
      </Link>

      <h1 style={{ margin: '16px 0 24px' }}>פרטי תגיות</h1>

      {/* ───────────── טאב בר ───────────── */}
      <div style={{
        display: 'flex',
        gap: 16,
        borderBottom: '1px solid #e9ecef',
        marginBottom: 24
      }}>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontWeight: activeTag === tag ? 600 : 400,
              borderBottom: activeTag === tag
                ? '3px solid #7e64e0'
                : '3px solid transparent',
              cursor: 'pointer',
              color: activeTag === tag ? '#7e64e0' : '#495057'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ───────────── תצוגת פעילויות של הטאב הנבחר ───────────── */}
      {activeTag && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, color: '#495057', marginBottom: 16 }}>
            {activeTag}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24
          }}>
            {activities.map(act => {
              const free = Math.max(act.capacity - act.participants, 0);
              return (
                <div key={act.id} style={{
                  background: '#fff',
                  border: '1px solid #e9ecef',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{act.title}</h3>
                  <DonutChart
                    title=""
                    data={[
                      { id: 'נרשמים', value: act.participants, color: '#7e64e0' },
                      { id: 'פנויים',  value: free,            color: '#ffe87e' }
                    ]}
                    size={120}
                    colors={['#7e64e0', '#ffd400']}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
