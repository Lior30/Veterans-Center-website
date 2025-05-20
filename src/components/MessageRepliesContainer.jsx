import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";

export default function MessageRepliesContainer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    async function load() {
      const msgSnap = await getDoc(doc(db, "messages", id));
      if (msgSnap.exists()) setMessage({ id: msgSnap.id, ...msgSnap.data() });

      const rSnap = await getDocs(collection(db, "messages", id, "replies"));
      setReplies(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, [id]);

  const handleDeleteReply = async (rid) => {
    await deleteDoc(doc(db, "messages", id, "replies", rid));
    const rSnap = await getDocs(collection(db, "messages", id, "replies"));
    setReplies(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  if (!message) return <p>Loading…</p>;

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h2>Replies for: {message.title}</h2>
      {replies.length === 0 ? (
        <p>No replies yet.</p>
      ) : (
        replies.map(r => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              marginBottom: 16,
              borderRadius: 4,
              textAlign: "left",
            }}
          >
            <p>
              <strong>{r.fullname}</strong> ({r.phone})
            </p>
            <p>{r.replyText}</p>
            <button onClick={() => handleDeleteReply(r.id)}>
              Delete Reply
            </button>
          </div>
        ))
      )}
      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}
