// src/components/Surveys.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Surveys() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>ניהול סקרים</h2>
      <div style={{ display: "inline-block", marginTop: 20, direction: "rtl" }}>
        {/* Removed duplicate "צפייה ומענה על סקרים" */}
        <Link to="/surveys/results">
          <button style={{ display: "block", width: 250, margin: "10px 0" }}>
            צפייה בתוצאות סקרים
          </button>
        </Link>
        <Link to="/surveys/create">
          <button style={{ display: "block", width: 250, margin: "10px 0" }}>
            יצירת סקר חדש
          </button>
        </Link>
      </div>
    </div>
  );
}