// src/components/MessageListDesign.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function MessageListDesign({ messages, onDelete }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>All Messages</h2>
      {messages.length === 0 ? (
        <p>No messages published yet.</p>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              margin: "10px auto",
              maxWidth: 600,
              borderRadius: 4,
              textAlign: "left",
            }}
          >
            <h3>{m.title}</h3>
            <p><em>At: {m.location}</em></p>
            <p>{m.body}</p>
            <div style={{ marginTop: 12 }}>
+             <Link to={`/messages/replies/${m.id}`}>
+               <button style={{ marginRight: 8 }}>View Replies</button>
+             </Link>
              <button onClick={() => onDelete(m.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
      <div style={{ marginTop: 20 }}>
        <Link to="/messages">
          <button>← Back to Manage</button>
        </Link>
      </div>
    </div>
  );
}
