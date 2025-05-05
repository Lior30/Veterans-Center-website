import React, { useState } from 'react';
import useCollectionCRUD from '../hooks/useCollectionCRUD';

export default function FlyersContainer() {
  const { docs: flyers, addItem, deleteItem } = useCollectionCRUD('flyers');
  const [title, setTitle]     = useState('');
  const [url, setUrl]         = useState('');
  const [desc, setDesc]       = useState('');

  const addFlyer = () => addItem({
    title, url, description: desc, createdAt: new Date(),
  }).then(() => { setTitle(''); setUrl(''); setDesc(''); });

  return (
    <section className="box">
      <h2>פליירים</h2>
      <ul>
        {flyers.map((f) => (
          <li key={f.id}>
            <strong>{f.title}</strong>{' '}
            <a href={f.url} target="_blank" rel="noreferrer">קישור</a>{' '}
            <button onClick={() => deleteItem(f.id)}>מחק</button>
            <p>{f.description}</p>
          </li>
        ))}
      </ul>

      <h3>הוספת פלייר</h3>
      <input placeholder="כותרת" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="URL"    value={url}   onChange={e => setUrl(e.target.value)} />
      <input placeholder="תיאור" value={desc}  onChange={e => setDesc(e.target.value)} />
      <button onClick={addFlyer}>שמור</button>
    </section>
  );
}
