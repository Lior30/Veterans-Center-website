import React from "react";
import { Link } from "react-router-dom";

export default function ManageMessages() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>ניהול הודעות</h2>
      <div style={{ display: "inline-block", marginTop: 20 }}>
        <Link to="/messages/create">
          <button style={{ display: "block", width: 200, margin: "10px 0" }}>
            יצירת הודעה חדשה
          </button>
        </Link>
        <Link to="/messages/list">
          <button style={{ display: "block", width: 200, margin: "10px 0" }}>
            צפה בכל ההודעות 
          </button>
        </Link>
      </div>
    </div>
  );
}
