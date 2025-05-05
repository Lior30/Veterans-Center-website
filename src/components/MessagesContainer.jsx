import React, { useState } from 'react';
import useCollectionCRUD from '../hooks/useCollectionCRUD';

export default function MessagesContainer() {
  const { docs: messages, addItem } = useCollectionCRUD('messages');
  const [title, setTitle]   = useState('');
  const [content, setContent] = useState('');

  const addMessage = () => addItem({
    title, content, createdAt: new Date(),
  }).then(() => { setTitle(''); setContent(''); });

  return (
    <section className="box">
      <h2>הודעות</h2>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>
            <strong>{m.title}</strong>
            <p>{m.content}</p>
          </li>
        ))}
      </ul>

      <h3>הוספת הודעה</h3>
      <input placeholder="כותרת" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="תוכן" value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={addMessage}>שמור הודעה</button>
    </section>
  );
}
