import { Link } from "react-router-dom";

export default function PublicMessageBoardDesign({ messages }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Message Board</h2>
      {messages.length === 0 ? (
        <p>No announcements at the moment.</p>
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
            <p><em>At: {m.location || "—"}</em></p>
            <p>{m.body}</p>
            <Link to={`/messages/reply/${m.id}`}>
              <button>Reply Privately</button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
