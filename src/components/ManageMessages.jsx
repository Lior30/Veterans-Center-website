import React from "react";
import { Link } from "react-router-dom";

export default function ManageMessages() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Manage Messages</h2>
      <div style={{ display: "inline-block", marginTop: 20 }}>
        <Link to="/messages/create">
          <button style={{ display: "block", width: 200, margin: "10px 0" }}>
            Create New Message
          </button>
        </Link>
        <Link to="/messages/list">
          <button style={{ display: "block", width: 200, margin: "10px 0" }}>
            View All Messages
          </button>
        </Link>
      </div>
    </div>
  );
}
