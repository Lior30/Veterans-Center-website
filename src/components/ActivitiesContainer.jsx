import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function ActivitiesContainer() {
  /* ---------- Activities ---------- */
  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState('');
  const [activityRecurring, setActivityRecurring] = useState(false);
  const [activityTime, setActivityTime] = useState('');

  /* ---------- Participants ---------- */
  const [selectedId, setSelectedId] = useState('');
  const [partName, setPartName] = useState('');
  const [partPhone, setPartPhone] = useState('');

  const loadActivities = useCallback(async () => {
    const snap = await getDocs(collection(db, 'activities'));
    setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const addActivity = async () => {
    await addDoc(collection(db, 'activities'), {
      name: activityName,
      isRecurring: activityRecurring,
      time: activityTime,
    });
    setActivityName('');
    setActivityRecurring(false);
    setActivityTime('');
    loadActivities();
  };

  const addParticipant = async () => {
    if (!selectedId) return;
    await addDoc(
      collection(db, `activities/${selectedId}/participants`),
      { name: partName, phone: partPhone }
    );
    setPartName(''); setPartPhone(''); setSelectedId('');
  };

  return (
    <section className="box">
      <h2>פעילויות</h2>

      <ul>
        {activities.map((a) => (
          <li key={a.id}>
            <strong>{a.name}</strong> | חוזר: {a.isRecurring ? 'כן' : 'לא'} | שעה: {a.time}{' '}
            <button onClick={() => setSelectedId(a.id)}>הוסף משתתף</button>
          </li>
        ))}
      </ul>

      <h3>הוספת פעילות</h3>
      <input placeholder="שם פעילות" value={activityName} onChange={e => setActivityName(e.target.value)} />
      <label>
        חוזר?
        <input type="checkbox" checked={activityRecurring}
               onChange={e => setActivityRecurring(e.target.checked)} />
      </label>
      <input placeholder="שעה לדוג׳ 10:00-11:00" value={activityTime}
             onChange={e => setActivityTime(e.target.value)} />
      <button onClick={addActivity}>שמור</button>

      {selectedId && (
        <div className="subBox">
          <h4>הוספת משתתף</h4>
          <input placeholder="שם" value={partName} onChange={e => setPartName(e.target.value)} />
          <input placeholder="טלפון" value={partPhone} onChange={e => setPartPhone(e.target.value)} />
          <button onClick={addParticipant}>שמור משתתף</button>
        </div>
      )}
    </section>
  );
}
