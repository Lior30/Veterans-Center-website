import React, { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function SurveysContainer() {
  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc]   = useState('');
  const [isActive, setIsActive] = useState(true);

  const [selectedId, setSelectedId] = useState('');
  const [answers, setAnswers]       = useState('');

  const loadSurveys = useCallback(async () => {
    const snap = await getDocs(collection(db, 'surveys'));
    setSurveys(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => { loadSurveys(); }, [loadSurveys]);

  const addSurvey = async () => {
    await addDoc(collection(db, 'surveys'), { title, description: desc, isActive });
    setTitle(''); setDesc(''); setIsActive(true); loadSurveys();
  };

  const addResponse = async () => {
    await addDoc(collection(db, `surveys/${selectedId}/responses`),
                 { answers, createdAt: new Date() });
    setAnswers(''); setSelectedId('');
  };

  return (
    <section className="box">
      <h2>סקרים</h2>
      <ul>
        {surveys.map((s) => (
          <li key={s.id}>
            <strong>{s.title}</strong> (פעיל: {s.isActive ? 'כן' : 'לא'})<br />
            {s.description} <br />
            <button onClick={() => setSelectedId(s.id)}>שלח תשובות</button>
          </li>
        ))}
      </ul>

      <h3>הוספת סקר</h3>
      <input placeholder="כותרת" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="תיאור" value={desc}  onChange={e => setDesc(e.target.value)} />
      <label>
        פעיל?
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
      </label>
      <button onClick={addSurvey}>שמור סקר</button>

      {selectedId && (
        <div className="subBox">
          <h4>מילוי סקר</h4>
          <textarea placeholder="התשובות שלך…" value={answers}
                    onChange={e => setAnswers(e.target.value)} />
          <button onClick={addResponse}>שמור תשובות</button>
        </div>
      )}
    </section>
  );
}
